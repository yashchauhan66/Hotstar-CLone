import mongoose from "mongoose"
const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: String,
    email: {type: String, unique: true},
    avatar: String,
    preferences: {
        category: [String],
        language: String
    },
    watchHistory: [
        {
            videoId: String,
            watchedAt: { type: Date, default: Date.now }
        }
    ]
} , {timestamps: true});
const User = mongoose.model("User", UserSchema);
export default User;