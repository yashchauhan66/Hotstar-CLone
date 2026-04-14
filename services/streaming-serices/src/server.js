import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import streamRoutes from './routes/streamRoutes.js';
import { BUCKET_NAME } from './config/s3.js';


const app = express();

// Enable CORS for Next.js frontend
app.use(cors({
  origin: "*", 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range']
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Streaming service is running',
    timestamp: new Date().toISOString()
  });
});


app.use('/api', streamRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});


const PORT = process.env.PORT || 5005;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Streaming Service running on port ${PORT}`);
});

export default app;
