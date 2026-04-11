import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import videoRoutes from './routes/videoRoutes.js';
import dotenv from 'dotenv';
dotenv.config();
import auth from "./middlewares/authMiddleware.js";


const app = express();


app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '100mb' }));

app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use((req, res, next) => {
  res.setTimeout(300000, () => {
    console.log('Request timeout');
    res.status(408).send('Request timeout');
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', videoRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});


app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});


const PORT = process.env.PORT || 5003;


const startServer = async () => {
  try {
    
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
