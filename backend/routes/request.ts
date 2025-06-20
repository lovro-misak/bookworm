import express from "express";
const router = express.Router();
const pool = require("../db");
import jwt, { type JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_!2J#lR8vKm$5xZ7pD9c@";
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

router.patch("/accept/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query(
            `SELECT * FROM Request WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ message: "Request not found" });
            return;
        }
    
        const bookId = result.rows[0].bookid;
    
        await pool.query(
            `UPDATE Request SET statusreq = 'accepted' WHERE id = $1`,
            [id]
        );
    
        await pool.query(
            `UPDATE Book SET status = 'Unavailable' WHERE idbook = $1`,
            [bookId]
        );

        const senderId = result.rows[0].senderid;
        const receiverId = result.rows[0].receiverid;

        const emailQuery = await pool.query(
            `SELECT email FROM person WHERE id = $1`, [senderId]
        );
        const email = emailQuery.rows[0]?.email;

        const nameQuery = await pool.query(
            `SELECT username FROM person WHERE id = $1`, [receiverId]
        );
        const name = nameQuery.rows[0]?.username;

        const bookQuery = await pool.query(
            `SELECT title from book WHERE idbook = $1`, [bookId]
        );
        const book = bookQuery.rows[0]?.title;

        const message = `${name} has accepted your request for ${book}`
        try {
            await publisher.publish(`notify:${senderId}`, message);
            console.log("published message: ", message);
        } catch (err) {
            console.error(`Failed to publish to notify:${senderId}`, err);
        }

        await sendEmail({
            to: email,
            subject: "Book request accepted!",
            text: `${name} has accepted your request for ${book}`
        });
    
        res.status(200).json({ message: "Request accepted and book marked unavailable" });
        return;
    } catch (error) {
        console.error(error);
    }
});

router.patch("/reject/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query(
            `SELECT * FROM Request WHERE id = $1`,
            [id]
        );
        
        await pool.query(
            `UPDATE Request SET statusreq = 'rejected' WHERE id = $1`,
            [id]
        );

        const senderId = result.rows[0].senderid;
        const receiverId = result.rows[0].receiverid;
        const bookId = result.rows[0].bookid;

        const emailQuery = await pool.query(
            `SELECT email FROM person WHERE id = $1`, [senderId]
        );
        const email = emailQuery.rows[0]?.email;

        const nameQuery = await pool.query(
            `SELECT username FROM person WHERE id = $1`, [receiverId]
        );
        const name = nameQuery.rows[0]?.username;

        const bookQuery = await pool.query(
            `SELECT title from book WHERE idbook = $1`, [bookId]
        );
        const book = bookQuery.rows[0]?.title;

        const message = `${name} has rejected your request for ${book}`
        try {
            await publisher.publish(`notify:${senderId}`, message);
            console.log("published message: ", message);
        } catch (err) {
            console.error(`Failed to publish to notify:${senderId}`, err);
        }

        await sendEmail({
            to: email,
            subject: "Book request rejected!",
            text: `${name} has rejected your request for ${book}`
        });
    
        res.status(200).json({ message: "Request rejected" });
        return;
    } catch (error) {
        console.error(error);
    }
});

router.post("/send", async (req, res) => {
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
        const { idbook, message } = req.body;

        const receiverQuery = await pool.query(
            `SELECT ownerid FROM book WHERE idbook = $1`, [idbook]
        );
        const receiverId = receiverQuery.rows[0]?.ownerid;

        const senderQuery = await pool.query(
            `SELECT username FROM person WHERE id = $1`, [id]
        );
        const senderName = senderQuery.rows[0]?.username;

        const emailQuery = await pool.query(
            `SELECT email FROM person WHERE id = $1`, [receiverId]
        );
        const email = emailQuery.rows[0]?.email;

        const bookQuery = await pool.query(
            `SELECT title from book WHERE idbook = $1`, [idbook]
        );
        const book = bookQuery.rows[0]?.title;

        console.log(senderName, " ", email, " ", book)

        if (!receiverId) {
            res.status(400).json({ message: "Book not found or missing owner ID." });
            return;
        }

        if(message !== undefined){
            await pool.query(
                `INSERT INTO request (bookid, senderid, receiverid, statusreq, message)
                 VALUES ($1, $2, $3, 'pending', $4)`,
                 [idbook, id, receiverId, message]
            );

            const notification = `${senderName} has sent a request for ${book}`
            try {
                await publisher.publish(`notify:${receiverId}`, notification);
                console.log("published message: ", notification);
            } catch (err) {
                console.error(`Failed to publish to notify:${receiverId}`, err);
            }

            await sendEmail({
                to: email,
                subject: "Book request for one of your books!",
                text: `${senderName} has sent a request for ${book}: ${message}`
            });

            res.status(200).json({ message: "Request sent successfully" });
            return;
        } else {
            await pool.query(
                `INSERT INTO request (bookid, senderid, receiverid, statusreq)
                 VALUES ($1, $2, $3, 'pending')`,
                 [idbook, id, receiverId]
            );

            const notification = `${senderName} has sent a request for ${book}`
            try {
                await publisher.publish(`notify:${receiverId}`, notification);
                console.log("published message: ", notification);
            } catch (err) {
                console.error(`Failed to publish to notify:${receiverId}`, err);
            }

            await sendEmail({
                to: email,
                subject: "Book request for one of your books!",
                text: `${senderName} has sent a request for ${book}`
            });

            res.status(200).json({ message: "Request sent successfully" });
            return;
        }
    } catch (error) {
        console.error(error);
    }
});

export default router;