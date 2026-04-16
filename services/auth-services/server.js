import express from "express";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import { verifyToken } from "./controllers/authController.js"
import cors from "cors";

import promBundle from "express-prom-bundle";
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  promClient: { collectDefaultMetrics: {} }
});

const app = express();
app.use(metricsMiddleware);
const PORT = process.env.PORT || 5001;
console.log("Starting Auth Service on PORT:", PORT);

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health Check Endpoint
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

app.use((req, res, next) => {
    console.log(`[AUTH-IN] ${req.method} ${req.url} (original: ${req.originalUrl})`);
    next();
});

// Routes
app.use("/api/auth", authRoute); 
app.get("/verify", verifyToken);

app.get("/", (req, res) => {
    res.send("Auth Service is healthy");
});

connectDB();

app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] Auth Service running on port ${PORT}`);
});