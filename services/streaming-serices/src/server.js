import express from 'express';
import cors from 'cors';
import streamRoutes from './routes/streamRoutes.js';

const app = express();
const PORT = process.env.PORT || 5005;
console.log("Starting Streaming Service on PORT:", PORT);

app.use(cors({
  origin: "*", 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range']
}));

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

app.get('/api-health', (req, res) => {
  res.json({
    success: true,
    message: 'Streaming service is healthy',
    port: PORT
  });
});

app.use(["/api", "/"], streamRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[OK] Streaming Service running on port ${PORT}`);
});

export default app;
