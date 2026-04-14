import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from 'fs';
import path from 'path';

export const createProfile=async(req , res)=>{
    const {name , email } = req.body;
    const user= await User.create({
        userId: req.user.id,
        name: name || req.user.name, // Fallback to token name if available
        email: req.user.email // Always use email from token
    })
    
    res.json(user);
}

export const getProfile = async (req, res) => {
  try {
    console.log('Full req.user object:', JSON.stringify(req.user));
    console.log('Fetching profile for userId:', req.user?.id);
    
    if (!req.user || !req.user.id) {
       console.error('Invalid user data in request object');
       return res.status(401).json({ message: "Invalid user data in token" });
    }

    const user = await User.findOne({ userId: req.user.id });
    res.json(user);
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export const updateProfile = async (req, res) => {
  // Prevent email from being updated
  const { email, ...updateData } = req.body;
  
  const user = await User.findOneAndUpdate(
    { userId: req.user.id },
    updateData,
    { new: true }
  )

  res.json(user)
}

export const addToHistory = async (req, res) => {
  const { videoId } = req.body

  const user = await User.findOneAndUpdate(
    { userId: req.user.id },
    {
      $push: { watchHistory: { videoId } }
    },
    { new: true }
  )

  res.json(user)
}


export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

   
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    
    const user = await User.findOneAndUpdate(
      { userId: req.user.id },
      { avatar: avatarPath },
      { new: true, upsert: true }
    );

    
    if (user && user.avatar && user.avatar !== avatarPath) {
      const oldAvatarPath = path.join(process.cwd(), user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: user
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
}