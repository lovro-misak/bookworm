import express from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import personRoute from "./routes/person";
import booksRoute from "./routes/books";
import requestRoute from "./routes/request";
import subsRoute from "./routes/subs";
import path from "path";
import { setupWebSocketServer } from "./utils/websocket";
//import { subscriber } from "./utils/redis";
/*const nodemailer = require('nodemailer');

async function notifyAdmin() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'bookworm.app25@gmail.com',
            pass: 'domgagdckwsixmnn'
        }
    })

    const info = await transporter.sendMail({
        from: "bookworm.app25@gmail.com",
        to: "bookworm.app25@gmail.com",
        subject: "Test",
        text: "This is a test mail...",
    })

    console.log("Message sent");
}

await notifyAdmin();*/

const app = express();
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const PORT = process.env.PORT || 3001;
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_!2J#lR8vKm$5xZ7pD9c@";
setupWebSocketServer();

app.use(express.json());
app.use(cors({ origin: allowedOrigin}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/update", personRoute);
app.use("/books", booksRoute);
app.use("/request", requestRoute);
app.use("/subs", subsRoute);

/*subscriber.on("message", (channel, message) => {
    console.log(`New book in ${channel}:`, JSON.parse(message));
})*/

app.get("/", (req, res) => {
    res.send("Hello from Express + Bun server");
});

app.post("/login", async (req, res) => {
    try {
        console.log("REQ BODY", req.body);
        const { username, password } = req.body;

        const checkPerson = await pool.query(
            'SELECT * FROM person WHERE username = $1', [username]
        );

        if(checkPerson.rows.length === 0){
            res.status(401).json({ message: "Invalid username or password"});
        }

        const person = checkPerson.rows[0];
        console.log("person ", person);

        const checkPassword = await bcrypt.compare(password, person.hashedpassword);

        if(!checkPassword){
            res.status(401).json({ message: "Invalid username or password"});
        } else {
            const token = jwt.sign(
                { id: person.id, username: person.username },
                JWT_SECRET,
                { expiresIn: "2h" }
            );

            res.status(200).json({ message: "Login successful", token, person: { username: person.username}});
        }
    } catch (error) {
        console.error(error);
    }
})

app.post("/signup", async (req, res) => {
    try {
        console.log("REQ BODY", req.body);
        const { firstname, lastname, email, username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newPerson = await pool.query(
            `INSERT INTO person (firstname, lastname, email, username, hashedPassword)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, username, email`,
            [firstname, lastname, email, username, hashedPassword]
        );

        console.log("newPerson ", newPerson);

        const token = jwt.sign(
            { id: newPerson.id, username: newPerson.username },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(201).json({
            message: "Person created",
            token,
            person: newPerson.rows[0],
        });

    } catch (error) {
        console.error(error);
        if((error as any).detail.includes("email")){
            res.status(409).json({
                message: "E-mail already taken"
            })
        }
    }
});

app.get("/auth", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({ message: "No token provided!"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = (decoded as JwtPayload).id;
        const { rows } = await pool.query (
            `SELECT * FROM person WHERE id=$1`, [id]
        );
        const user = rows[0];
        if(!user){
            res.status(404).json({ message: "User not found"});
            return;
        }

        res.status(200).json(user);
        return;
    } catch (err){
        res.status(401).json({ message: "Invalid token"});
        return;
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port:${PORT}`);
});