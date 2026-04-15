import express from "express";
import cors from "cors";
import { authProxy, userProxy, videoProxy, streamingProxy } from "./routes/proxyRoutes.js";
import {rateLimit} from "express-rate-limit"

const app = express();
const PORT = process.env.PORT || 5000;
console.log("Starting API Gateway on PORT:", PORT);

const limit=rateLimit({
  
  windowMs: 10 * 60 * 1000,
  max: 300,
  message: "Too many requests, try again later",
})

app.use(cors({
  origin: "*", 
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));


app.use((req, res, next) => {
  console.log(`[GATEWAY-INCOMING] ${req.method} ${req.url} (original: ${req.originalUrl})`);
  next();
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use(limit);
app.use("/api/auth", authProxy);
app.use("/api/users", userProxy);
app.use("/api/videos", videoProxy);
app.use("/api/upload", videoProxy);
app.use("/api/stream", streamingProxy);


app.use(express.json());

app.use((req, res) => {
  console.log(`[GATEWAY-404] Route not found: ${req.originalUrl}`);
  res.status(404).json({
    error: "Gateway Route not found",
    path: req.originalUrl
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[OK] Gateway running on port ${PORT}`);
});
