import express from "express";
import cors from "cors";
import { authProxy, userProxy, videoProxy, streamingProxy } from "./routes/proxyRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;
console.log("Starting API Gateway on PORT:", PORT);

app.use(cors({
  origin: "*", 
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Route for health checks
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Mount proxies BEFORE body-parser to avoid proxy issues
app.use("/api/auth", authProxy);
app.use("/api/users", userProxy);
app.use("/api/videos", videoProxy);
app.use("/api/stream", streamingProxy);

// Only parse JSON for Gateway's own management routes (if any)
app.use(express.json());

app.use((req, res) => {
  res.status(404).json({
    error: "Gateway Route not found",
    path: req.originalUrl
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[OK] Gateway running on port ${PORT}`);
});
