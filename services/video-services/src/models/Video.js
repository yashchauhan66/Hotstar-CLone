

import mongoose from 'mongoose';


const videoSchema = new mongoose.Schema({
  
  title: {
    type: String,
    required: true,  
    trim: true       
  },
  
  description: {
    type: String,
    default: ''
  },
  
  thumbnail: {
    type: String,
    default: ''
  },
  
  category: {
    type: String,
    default: 'movie'
  },
  
  tags: [{
    type: String
  }],
  
  videoUrl: {
    type: String,
    required: true
  },
  
  streamingUrl: {
    type: String,
    required: false
  },
  
  originalName: {
    type: String,
    required: true
  },
  
  size: {
    type: Number,
    required: true
  },
  
  duration: {
    type: Number,
    default: 0
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  likes: {
    type: Number,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed'],
    default: 'uploaded'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


export const Video = mongoose.model('Video', videoSchema);
