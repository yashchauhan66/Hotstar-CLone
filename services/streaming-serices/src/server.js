import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import streamRoutes from './routes/streamRoutes.js';
import { BUCKET_NAME } from './config/s3.js';


const app = express();

// Enable CORS for Next.js frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
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

// Debug endpoint to check S3 config
app.get('/debug', (req, res) => {
  res.json({
    env: {
      AWS_REGION: process.env.AWS_REGION || 'NOT SET',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'NOT SET',
      AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY ? 'SET' : 'NOT SET',
      AWS_SECRET_KEY: process.env.AWS_SECRET_KEY ? 'SET' : 'NOT SET',
      USE_S3: process.env.USE_S3 || 'NOT SET'
    },
    s3Config: {
      BUCKET_NAME: BUCKET_NAME || 'undefined'
    }
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

app.listen(PORT, () => {
  console.log(` Streaming service running on http://localhost:${PORT}`);
  console.log(` Video storage: ${process.env.VIDEO_STORAGE_PATH || './src/videos'}`);
  console.log(`
Test URLs:
- List videos:    http://localhost:${PORT}/api/videos
- Stream video:   http://localhost:${PORT}/api/stream/your-video.mp4
- Video player:   http://localhost:${PORT}/api/player/your-video.mp4
- Health check:   http://localhost:${PORT}/health
  `);
});

export default app;
