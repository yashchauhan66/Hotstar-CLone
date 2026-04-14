import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config({ override: true });
const connectDB= async()=>{
    try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDb Connected Successfully");
    }catch(error){
     console.log("error", error.message);
    }
}
export default connectDB;
