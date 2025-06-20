import express from "express";
const router = express.Router();
const pool = require("../db");
import jwt, { type JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_!2J#lR8vKm$5xZ7pD9c@";
import upload from "../upload";
const nodemailer = require('nodemailer');
import { publisher } from "../utils/redis";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'bookworm.app25@gmail.com',
        pass: 'domgagdckwsixmnn'
    }
});

async function sendEmail({ to, subject, text }: { to: string, subject: string; text: string}) {
    return transporter.sendMail({
      from: 'bookworm.app25@gmail.com',
      to,
      subject,
      text,
    });
}

router.get("/", async (req, res) => {
    const books = await pool.query(
        `SELECT b.*, p.username, p.email
         FROM Book b
         JOIN Person p ON b.ownerId = p.id
         WHERE b.status = 'Available'
         ORDER BY b.idbook DESC`
    );
    res.json(books.rows);
});

router.get("/foryou", async (req, res) => {
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({ message: "No token provided!"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = (decoded as JwtPayload).id;
        const books = await pool.query(
            `SELECT b.*, p.username, p.email
             FROM Book b JOIN Person p ON b.ownerid = p.id
             WHERE (title IN (SELECT topic FROM subscriptions WHERE userid = $1)
             OR
             author IN (SELECT topic FROM subscriptions WHERE userid = $1)
             OR
             genre IN (SELECT topic FROM subscriptions WHERE userid = $1))
             AND
             b.ownerid != $1
             AND
             b.status = 'Available'
             ORDER BY idbook DESC;`, [id]
        );
        res.status(200).json(books.rows);
        return;
    } catch (err){
        console.error("JWT or DB error:", err);
        res.status(401).json({ message: "Invalid token"});
        return;
    }
})

router.get("/wishlist", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({ message: "No token provided!"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = (decoded as JwtPayload).id;
        const wishlist = await pool.query(
            `SELECT w.*, b.*
             FROM Wishlist w
             JOIN Book b ON w.bookid = b.idbook
             WHERE w.personid = $1 AND b.status = 'Available'`, [id]
        );
        res.status(200).json(wishlist.rows);
        return;
    } catch (err){
        res.status(401).json({ message: "Invalid token"});
        return;
    }
});

router.post("/addwishlist/:id", async (req,res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({ message: "No token provided!"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try{
        const idbook = req.params.id;
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = (decoded as JwtPayload).id;
        await pool.query(
            `INSERT INTO wishlist (personid, bookid)
             VALUES ($1, $2)`, [id, idbook]
        );
        res.status(200).json("Book added to wishlist");
        return;
    } catch (err){
        res.status(401).json({ message: "Invalid token"});
        return;
    }
});

router.get("/posts", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({ message: "No token provided!"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = (decoded as JwtPayload).id;
        const posts = await pool.query(
            `SELECT *
             FROM Book
             WHERE ownerid = $1`, [id]
        );
        res.status(200).json(posts.rows);
        return;
    } catch (err){
        res.status(401).json({ message: "Invalid token"});
        return;
    }
});

router.get("/sent", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({ message: "No token provided!"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = (decoded as JwtPayload).id;
        const posts = await pool.query(
            `SELECT r.*, b.*, p.username, p.email 
             FROM Request r
             JOIN Book b ON r.bookid = b.idbook
             JOIN Person p ON b.ownerId = p.id
             WHERE r.senderid = $1
             ORDER BY r.id DESC`, [id]
        );
        res.status(200).json(posts.rows);
        return;
    } catch (err){
        res.status(401).json({ message: "Invalid token"});
        return;
    }
});

router.get("/received", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({ message: "No token provided!"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = (decoded as JwtPayload).id;
        const posts = await pool.query(
            `SELECT r.*, b.*, p.username, p.email 
             FROM Request r
             JOIN Book b ON r.bookid = b.idbook
             JOIN Person p ON r.senderId = p.id
             WHERE r.receiverid = $1
             ORDER BY r.id DESC`, [id]
        );
        res.status(200).json(posts.rows);
        return;
    } catch (err){
        res.status(401).json({ message: "Invalid token"});
        return;
    }
});

router.post("/search", async (req, res) => {
    try {
        console.log("REQ BODY", req.body);
        const { book, author, genre } = req.body;

        const filters = [];
        const values = [];

        if (book && book.trim() !== "") {
            values.push(`%${book.trim()}%`);
            filters.push(`title ILIKE $${values.length}`);
        }
    
        if (author && author.trim() !== "") {
            values.push(`%${author.trim()}%`);
            filters.push(`author ILIKE $${values.length}`);
        }
    
        if (genre && genre.trim() !== "") {
            values.push(`%${genre.trim()}%`);
            filters.push(`genre ILIKE $${values.length}`);
        }

        filters.push(`status = 'Available'`);

        const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
        const query = `SELECT b.*, p.username, p.email FROM Book b JOIN Person p ON b.ownerId = p.id ${whereClause} ORDER BY b.idbook DESC`

        const posts = await pool.query(query, values);
        res.status(200).json(posts.rows);
        return;

    } catch (error) {
        console.error(error);
    }
});

router.post("/post", upload.single("coverimage"), async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({ message: "No token provided!"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = (decoded as JwtPayload).id;
        console.log("REQ BODY", req.body);
        console.log("REQ FILE", req.file);

        const { book, author, genre } = req.body;

        type SubscriberRow = { userid: string };
        type EmailRow = { email: string };

        const subscribers: { rows: SubscriberRow[] } = await pool.query(
            `SELECT DISTINCT userid FROM subscriptions
             WHERE LOWER(topic) IN ($1, $2, $3) AND userid != $4`, [book.toLowerCase(), author.toLowerCase(), genre.toLowerCase(), id]
        );

        const userIds = subscribers.rows.map((r) => r.userid);
        
        console.log("userids: ", userIds);

        const emailsQuery: { rows: EmailRow[] } = await pool.query(
            `SELECT email FROM person WHERE id = ANY($1::int[])`, [userIds]
        );

        const emails = emailsQuery.rows.map((r) => r.email);

        console.log("emails: ", emails);

        if(req.file !== undefined){
            //const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file?.filename}`;
            const imageUrl = `/uploads/${req.file?.filename}`;

            await pool.query(
                `INSERT INTO book (ownerid, title, author, genre, status, coverimage)
                VALUES ($1, $2, $3, $4, 'Available', $5)`,
                [id, book, author, genre, imageUrl]
            );

            //await publisher.publish(`title:${book}`, JSON.stringify({ book, author, genre }));
            //await publisher.publish(`author:${author}`, JSON.stringify({ book, author, genre }));
            //await publisher.publish(`genre:${genre}`, JSON.stringify({ book, author, genre }));

            for (const userId of userIds){
                const message = `New book posted: ${book} by ${author} (genre: ${genre})`;
                try {
                    await publisher.publish(`notify:${userId}`, message);
                    console.log("published message: ", message);
                } catch (err) {
                    console.error(`Failed to publish to notify:${userId}`, err);
                }
            }

            for (const email of emails) {
                await sendEmail({
                    to: email,
                    subject: "New Book Posted!",
                    text: `Someone posted a book you might be interested in: ${book} by ${author} (genre: ${genre})`
                });
            }

            res.status(200).json({ message: "Book posted successfully" });
            return;
        } else {
            await pool.query(
                `INSERT INTO book (ownerid, title, author, genre, status)
                 VALUES ($1, $2, $3, $4, 'Available')`,
                 [id, book, author, genre]
            );

            //await publisher.publish(`title:${book}`, JSON.stringify({ book, author, genre }));
            //await publisher.publish(`author:${author}`, JSON.stringify({ book, author, genre }));
            //await publisher.publish(`genre:${genre}`, JSON.stringify({ book, author, genre }));

            for (const userId of userIds){
                const message = `New book posted: ${book} by ${author} (genre: ${genre})`;
                try {
                    await publisher.publish(`notify:${userId}`, message);
                    console.log("published message: ", message);
                } catch (err) {
                    console.error(`Failed to publish to notify:${userId}`, err);
                }
            }

            for (const email of emails) {
                await sendEmail({
                    to: email,
                    subject: "New Book Posted!",
                    text: `Someone posted a book you might be interested in: ${book} by ${author} (genre: ${genre})`
                });
            }
    
            res.status(200).json({ message: "Book posted successfully" });
            return;
        }
        

    } catch (error) {
        console.error(error);
    }
});

export default router;