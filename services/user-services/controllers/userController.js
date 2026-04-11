import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from 'fs';
import path from 'path';

export const createProfile=async(req , res)=>{
    const {name , email } = req.body;
    const user= await User.create({
        userId: req.user.id,
        name,
        email
    })
    
    res.json(user);
}

export const getProfile=async(req,res)=>{
    const user=await User.findOne({userId: req.user.id});
    res.json(user);
}

export const updateProfile = async (req, res) => {
  const user = await User.findOneAndUpdate(
    { userId: req.user.id },
    req.body,
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