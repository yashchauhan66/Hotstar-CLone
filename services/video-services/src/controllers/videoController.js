import { processUpload, processUploadWithThumbnail } from '../services/uploadService.js';
import { Video } from '../models/Video.js';

export const uploadVideoWithThumbnail = async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const video = await processUploadWithThumbnail(req.files, req.body);

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully with thumbnail',
      data: {
        id: video._id,
        title: video.title,
        videoUrl: video.videoUrl,
        thumbnail: video.thumbnail,
        status: video.status,
        createdAt: video.createdAt
      }
    });

  } catch (error) {
    console.error(' Upload error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: error.message
    });
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const video = await processUpload(req.file, req.body);

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        id: video._id,
        title: video.title,
        videoUrl: video.videoUrl,
        thumbnail: video.thumbnail,
        status: video.status,
        createdAt: video.createdAt
      }
    });

  } catch (error) {
    console.error(' Upload error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: error.message
    });
  }
};


export const getAllVideos = async (req, res) => {
  try {
  
    const videos = await Video.find()
      .sort({ createdAt: -1 })  
      .select('-__v');          
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
    
  } catch (error) {
    console.error('Fetch error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos'
    });
  }
};


export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).select('-__v');
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: video
    });
    
  } catch (error) {
    console.error('Fetch error:', error);
    
  
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid video ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video'
    });
  }
};


export const getTrendingVideos = async (req, res) => {
  try {
   
    const videos = await Video.find()
      .sort({ views: -1 })
      .limit(10)
      .select('-__v');
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Trending fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending videos'
    });
  }
};

export const getLatestVideos = async (req, res) => {
  try {
   
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-__v');
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Latest fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest videos'
    });
  }
};

export const getRecommendedVideos = async (req, res) => {
  try {
   
    const videos = await Video.aggregate([
      { $sample: { size: 10 } },
      { $project: { __v: 0 } }
    ]);
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Recommended fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended videos'
    });
  }
};

export const DeleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid video ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete video'
    });
  }
};

export const searchVideos = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const searchRegex = new RegExp(q, 'i');
    
    const videos = await Video.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { category: searchRegex }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search videos'
    });
  }
};
