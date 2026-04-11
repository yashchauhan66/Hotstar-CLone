

import { streamVideo, getVideoInfo, listVideos } from '../services/streamService.js';

export const streamVideoFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const range = req.headers.range;
    
    console.log(` Stream request: ${filename}`);
    console.log(` Range header: ${range || 'none (full file)'}`);
    

    await streamVideo(filename, range, res);
    
  } catch (error) {
    console.error('Stream error:', error);
    
  
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to stream video',
        error: error.message
      });
    }
  }
};


export const getVideoDetails = async (req, res) => {
  try {
    const { filename } = req.params;
    
    const info = await getVideoInfo(filename);
    
    if (!info) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...info,
        streamUrl: `/api/stream/${filename}`
      }
    });
    
  } catch (error) {
    console.error('Get info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get video info'
    });
  }
};


export const getAllVideos = async (req, res) => {
  try {
    const videos = await listVideos();
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
    
  } catch (error) {
    console.error('List videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list videos'
    });
  }
};


export const getPlayerPage = async (req, res) => {
  const { filename } = req.params;
  
  
  const info = await getVideoInfo(filename);
  if (!info) {
    return res.status(404).send('Video not found');
  }
  
 
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Video Player - ${filename}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #1a1a1a;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      margin: 0;
    }
    h1 { margin-bottom: 20px; }
    video {
      max-width: 90%;
      max-height: 70vh;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .info {
      margin-top: 20px;
      padding: 15px;
      background: #2a2a2a;
      border-radius: 8px;
    }
    .info p { margin: 5px 0; }
    code {
      background: #3a3a3a;
      padding: 2px 6px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <h1>${filename}</h1>
  <video controls autoplay>
    <source src="/api/stream/${filename}" type="${info.contentType}">
    Your browser does not support the video tag.
  </video>
  <div class="info">
    <p><strong>Size:</strong> ${(info.size / (1024 * 1024)).toFixed(2)} MB</p>
    <p><strong>Type:</strong> ${info.contentType}</p>
    <p><strong>Stream URL:</strong> <code>/api/stream/${filename}</code></p>
    <p><strong>Direct Link:</strong> <a href="/api/stream/${filename}" style="color: #4CAF50;">Click here</a></p>
  </div>
</body>
</html>
  `);
};
