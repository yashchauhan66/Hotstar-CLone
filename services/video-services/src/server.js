import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import videoRoutes from './routes/videoRoutes.js';

const app = express();
const PORT = process.env.PORT || 5003;
console.log("Starting Video Service on PORT:", PORT);

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));


app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

app.get('/api-health', (req, res) => {
  res.json({
    success: true,
    message: 'Video service is healthy',
    port: PORT
  });
});

app.use(["/api", "/"], videoRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[OK] Video Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
