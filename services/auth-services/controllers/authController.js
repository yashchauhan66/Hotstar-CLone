import User from "../models/authModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendToQueue } from "../service/producer.js";
import dotenv from "dotenv";
dotenv.config();

export const Signup = async (req, res) => {
    try {
        const { name, email, password , role} = req.body;
        if (!name || !email || !password ||!role) {
            console.log("Signup failed: Missing fields");
            return res.status(400).json({ message: "All fields are Required" })
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Signup failed: User already exists", email);
            return res.status(400).json({ message: "User already exists" });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashPassword,
            role:role
        });

        await newUser.save();
        console.log("User signed up successfully:", email , role);

        const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(201).json({
            message: "User Registered Successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role  
            },
            token
        });


    } catch (err) {
        console.error("Signup Error:", err.message);
        res.status(500).json({ message: "Internal Server Error" })
    }

};


export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are Required" })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        console.log("Login successful for user:", user.email);
      
        sendToQueue({
            type: "LOGIN_SUCCESS",
            email: user.email,
            subject: "Login Successful",
            text: `Hello ${user.name}, you have successfully logged in`,
        }).catch(err => console.error("RabbitMQ error (Login):", err.message));

        
        res.status(200).json({
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error hai ya to" })
    }
}

export const verifyToken = async (req, res) => {
    try {
        const Token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        if (!Token) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const decoded = jwt.verify(Token, process.env.JWT_SECRET);
        res.json(decoded);
    } catch (err) {
        res.status(401).json({ message: "Invalid Token" })
    }
}

export const GetProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const Logout = async (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
}

