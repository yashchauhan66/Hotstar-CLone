import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authProxy, userProxy, videoProxy, streamingProxy } from "./routes/proxyRoutes.js";

dotenv.config({ path: '.env', override: true });

const app = express();


app.use(cors({
  origin: "*", 
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use((req, res, next) => {
  console.log(`[GATEWAY] ${req.method} ${req.url}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "API Gateway",
    time: new Date().toISOString()
  });
});

app.use("/api/auth", authProxy);
app.use("/api/users", userProxy);
app.use("/api/videos", videoProxy);
app.use("/api/stream", streamingProxy);

app.use(express.json());


app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Gateway running on ${PORT}`);
});
