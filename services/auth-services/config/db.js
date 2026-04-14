import mongoose from "mongoose"

const connectDB= async(req , res)=>{
    try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDb Connected Successfully");
    }catch(error){
      console.log("Error connecting to database",error.message);
    }
}
export default connectDB;
