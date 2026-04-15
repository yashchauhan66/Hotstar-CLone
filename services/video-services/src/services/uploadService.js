

import { uploadToS3, uploadThumbnailToS3 } from '../config/s3.js';
import { Video } from '../models/Video.js';
import { fetchMoviePoster } from './tmdbService.js';
import fs from 'fs';
import path from 'path';

/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null
 */
const extractYouTubeId = (url) => {
  const patterns = [
    /youtu\.be\/([^#&?]{11})/,                          // youtu.be/ID
    /youtube\.com\/watch\?v=([^#&?]{11})/,               // youtube.com/watch?v=ID
    /youtube\.com\/embed\/([^#&?]{11})/,                // youtube.com/embed/ID
    /youtube\.com\/v\/([^#&?]{11})/,                    // youtube.com/v/ID
    /[?&]v=([^#&?]{11})/                                // ?v=ID or &v=ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

/**
 * Get thumbnail URL from YouTube video ID
 * @param {string} videoId - YouTube video ID
 * @returns {string} - Thumbnail URL
 */
const getYouTubeThumbnailUrl = (videoId) => {
  // Use maxresdefault.jpg for highest quality, fallback to hqdefault.jpg
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

/**
 * Get default thumbnail URL
 * @param {string} title - Video title (used for generating unique default)
 * @returns {string} - Default thumbnail URL
 */
const getDefaultThumbnailUrl = (title) => {
  // Use placehold.co to generate a colored placeholder with title initial
  const colors = ['3B82F6', 'EF4444', '10B981', 'EC4899', '6366F1', 'F59E0B'];
  const colorIndex = title.length % colors.length;
  const initial = title.charAt(0).toUpperCase();
  return `https://placehold.co/400x600/${colors[colorIndex]}/white?text=${encodeURIComponent(initial)}`;
};


/**
 * Process video upload with thumbnail support
 * @param {Object} files - Object containing video and optional thumbnail files
 * @param {Object} body - Form data from request
 * @returns {Promise<Object>} - Saved video document
 */
export const processUploadWithThumbnail = async (files, body) => {
  try {
    console.log('🎬 Processing video upload with thumbnail...');

    const videoFile = files.video ? files.video[0] : null;
    const thumbnailFile = files.thumbnail ? files.thumbnail[0] : null;

    if (!videoFile) {
      throw new Error('No video file provided');
    }

    
    console.log(' Uploading video to S3...');
    const videoBuffer = fs.readFileSync(videoFile.path);
    const videoUrl = await uploadToS3(
      videoBuffer,
      videoFile.originalname,
      videoFile.mimetype
    );
    fs.unlinkSync(videoFile.path);
    console.log(' Video uploaded to S3');

    
    let thumbnailUrl = '';

    
    if (thumbnailFile) {
      console.log(' Uploading user thumbnail to S3...');
      const thumbnailBuffer = fs.readFileSync(thumbnailFile.path);
      thumbnailUrl = await uploadThumbnailToS3(
        thumbnailBuffer,
        thumbnailFile.originalname,
        thumbnailFile.mimetype
      );
      fs.unlinkSync(thumbnailFile.path);
      console.log(' User thumbnail uploaded');
    }
    
    else if (body.youtubeUrl) {
      console.log(' Extracting thumbnail from YouTube URL...');
      const videoId = extractYouTubeId(body.youtubeUrl);
      if (videoId) {
        thumbnailUrl = getYouTubeThumbnailUrl(videoId);
        console.log(` YouTube thumbnail: ${thumbnailUrl}`);
      } else {
        console.log(' Invalid YouTube URL, will try TMDb or default');
      }
    }

  
    if (!thumbnailUrl && body.title) {
      console.log(' Fetching poster from TMDb...');
      const tmdbPoster = await fetchMoviePoster(body.title);
      if (tmdbPoster) {
        thumbnailUrl = tmdbPoster;
        console.log(' TMDb poster fetched');
      }
    }

    
    if (!thumbnailUrl) {
      thumbnailUrl = getDefaultThumbnailUrl(body.title || videoFile.originalname);
      console.log(' Using default thumbnail');
    }

  
    console.log(' Saving to database...');
    // Extract just the filename without the 'videos/' prefix
    // videoUrl format: https://bucket.s3.region.amazonaws.com/videos/uuid.mp4
    const filename = videoUrl.split('/').pop();
    const STREAMING_HOST = process.env.STREAMING_SERVICE_URL || 'http://streaming-service:5005';
    const streamingUrl = `${STREAMING_HOST}/api/stream/${filename}`;

    const video = new Video({
      title: body.title || videoFile.originalname,
      description: body.description || '',
      thumbnail: thumbnailUrl,
      category: body.category || 'movie',
      tags: body.tags ? JSON.parse(body.tags) : [],
      videoUrl: videoUrl,
      streamingUrl: streamingUrl,
      originalName: videoFile.originalname,
      size: videoFile.size,
      duration: body.duration || 0,
      views: 0,
      likes: 0,
      status: 'uploaded'
    });

    await video.save();
    console.log(' Video saved to database');

    return video;

  } catch (error) {
    console.error(' Upload processing failed:', error.message);
    
    if (files) {
      if (files.video && files.video[0] && fs.existsSync(files.video[0].path)) {
        fs.unlinkSync(files.video[0].path);
      }
      if (files.thumbnail && files.thumbnail[0] && fs.existsSync(files.thumbnail[0].path)) {
        fs.unlinkSync(files.thumbnail[0].path);
      }
    }
    throw error;
  }
};

/**
 * Process simple video upload (backward compatible)
 * @param {Object} file - Single video file (req.file from multer)
 * @param {Object} body - Form data from request
 * @returns {Promise<Object>} - Saved video document
 */
export const processUpload = async (file, body) => {
  try {
    console.log(' Processing simple video upload (backward compatible)...');

    
    const files = { video: [file] };
    return await processUploadWithThumbnail(files, body);

  } catch (error) {
    console.error(' Simple upload processing failed:', error.message);
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};
