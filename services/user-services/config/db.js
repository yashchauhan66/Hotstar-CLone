import mongoose from "mongoose";

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  
  if (!MONGO_URI) {
    console.error("MONGO_URI not found in environment variables!");
    return;
  }

  while (true) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("MongoDB Connected Successfully (User Service)");
      break;
    } catch (error) {
      console.error("Database connection failed, retrying in 5s...", error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

export default connectDB;
