import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import userRoute from "./routes/userRoute.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;
console.log("Starting User Service on PORT:", PORT);

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(["/api/users", "/"], userRoute);

app.get("/", (req, res) => {
    res.send("User Service is healthy");
});

connectDB();

app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] User Service running on port ${PORT}`);
});