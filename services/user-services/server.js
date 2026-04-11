import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import userRoute from "./routes/userRoute.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files for uploads (avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/users", userRoute);

app.get("/", (req, res) => {
    res.send("Server Health is ok...");
});

connectDB();
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});