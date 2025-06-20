import express from "express";
const router = express.Router();
import jwt, { type JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_!2J#lR8vKm$5xZ7pD9c@";
const pool = require("../db");
import upload from "../upload";

router.patch("/profile", async (req, res) => {
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
        const { firstname, lastname, bio, email, username } = req.body;

        const existingUser = await pool.query(
            `SELECT id FROM person WHERE username = $1 AND id != $2`,
            [username, id]
        );
        
        if (existingUser.rows.length > 0) {
            res.status(409).json({ message: "Username is already taken" });
            return;
        }

        const existingMail = await pool.query(
            `SELECT email FROM person WHERE email = $1 and id != $2`,
            [email, id]
        )

        if (existingMail.rows.length > 0){
            res.status(409).json({ message: "E-mail is already taken" });
        }

        const updatedPerson = await pool.query(
            `UPDATE person
             SET firstname = $1,
                 lastname = $2,
                 email = $3,
                 username = $4,
                 bio = $5
             WHERE id = $6`,
             [firstname, lastname, email, username, bio, id]
        );

        res.status(200).json({ message: "User updated successfully" });
        return;
    } catch (error) {
        console.error(error);
    }
});

router.patch("/picture", upload.single("profilepicture"), async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({ message: "No token provided!"});
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = (decoded as JwtPayload).id;

        if(!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const filename = req.file.filename;

        //const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
        const imageUrl = `/uploads/${filename}`;

        await pool.query(
            `UPDATE person
             SET profilepicture = $1
             WHERE id = $2`,
             [imageUrl, id]
        );

        res.status(200).json({ message: "Picture updated successfully" });
        return;
    } catch (error) {
        console.error(error);
    }
})

export default router;