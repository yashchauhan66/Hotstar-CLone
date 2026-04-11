import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config({ path: '.env' })
import { authProxy, userProxy, videoProxy, streamingProxy } from "./routes/proxyRoutes.js"

const app = express()


app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://frontend:3000'],
  credentials: true
}))


app.use("/api/auth", authProxy)
app.use("/api/users", userProxy)
app.use("/api/videos", videoProxy)
app.use("/api/stream", streamingProxy)


app.use(express.json())


app.get("/health", (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      auth: process.env.AUTH_SERVICE,
      user: process.env.USER_SERVICE,
      video: process.env.VIDEO_SERVICE,
      streaming: process.env.STREAMING_SERVICE
    }
  });
});

app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});


app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
