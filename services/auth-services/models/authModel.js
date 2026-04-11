import mongoose from "mongoose"
const UserSchema= new mongoose.Schema({
    name: {type: String , 
        required: true
    },

    email: {type: String , 
        required: true
    },

    password: {
        type: String || Number,
        required: true
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
    
}, {timestamps: true});
 const User = mongoose.model("User", UserSchema);
 export default User;