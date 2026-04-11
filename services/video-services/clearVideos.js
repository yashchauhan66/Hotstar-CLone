import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  thumbnail: String,
  category: String,
  tags: [String],
  videoUrl: String,
  streamingUrl: String,
  originalName: String,
  size: Number,
  duration: Number,
  views: Number,
  likes: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date
});

const Video = mongoose.model('Video', videoSchema);

async function clearVideos() {
  try {
    const result = await Video.deleteMany({});
    console.log(`Deleted ${result.deletedCount} videos from MongoDB`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting videos:', error);
    process.exit(1);
  }
}

clearVideos();
