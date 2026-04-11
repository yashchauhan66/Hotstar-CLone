import express from "express";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import { verifyToken } from "./controllers/authController.js"
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
// Enable CORS for Next.js frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());


app.use("/auth", authRoute); 
app.get("/verify", verifyToken);

app.get("/", (req, res) => {
    res.send("Server Health is ok...");
});

connectDB();
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});