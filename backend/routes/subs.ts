import express from "express";
const router = express.Router();
const pool = require("../db");
import jwt, { type JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_!2J#lR8vKm$5xZ7pD9c@";

router.get("/subscriptions", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({ message: "No token provided!"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = (decoded as JwtPayload).id;
        const subs = await pool.query(
            `SELECT * FROM Subscriptions
             WHERE userid = $1`, [id]
        );
        res.status(200).json(subs.rows);
        return;
    } catch (error) {
        console.error(error);
    }
})

router.post("/subscribe", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({ message: "No token provided!"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        console.log("REQ BODY", req.body);
        const { topic } = req.body;
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = (decoded as JwtPayload).id;
        const newSubs = await pool.query(
            `INSERT INTO Subscriptions (userid, topic)
             VALUES ($1, $2)`, [id, topic]
        );
        res.status(200).json(newSubs.rows);
        return;
    } catch (error) {
        console.error(error);
    }
});

router.delete("/unsubscribe/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const newSubs = await pool.query(
            `DELETE FROM Subscriptions WHERE id = $1`, [id]
        );     
        res.status(200).json(newSubs.rows);
        return;
    } catch (error) {
        console.error(error);
    }
});

export default router;