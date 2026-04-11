import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { s3Client, BUCKET_NAME, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '../config/s3.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIDEO_DIR = process.env.VIDEO_STORAGE_PATH || './src/videos';

const USE_S3 = !!(BUCKET_NAME && process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY);
console.log('🔍 S3 Configuration Check:');
console.log('   BUCKET_NAME:', BUCKET_NAME);
console.log('   AWS_ACCESS_KEY:', process.env.AWS_ACCESS_KEY ? 'SET' : 'NOT SET');
console.log('   AWS_SECRET_KEY:', process.env.AWS_SECRET_KEY ? 'SET' : 'NOT SET');
console.log('   USE_S3:', USE_S3);

/**
 * Stream video from S3 with range support
 * @param {string} key - S3 object key (e.g., "videos/filename.mp4")
 * @param {string} range - Range header from request
 * @param {Object} res - Express response object
 */
export const streamVideoFromS3 = async (key, range, res) => {
  try {
    console.log(`🔍 DEBUG: S3 Key = "${key}"`);
    console.log(`🔍 DEBUG: BUCKET = "${BUCKET_NAME}"`);
    console.log(`🔍 DEBUG: Range = "${range || 'none'}"`);
    
   
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    console.log(` DEBUG: Checking S3 HeadObject...`);
    const headResponse = await s3Client.send(headCommand);
    console.log(` DEBUG: File found! Size = ${headResponse.ContentLength} bytes`);
    const fileSize = headResponse.ContentLength;
    const contentType = headResponse.ContentType || 'video/mp4';

  
    if (!range) {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      });
      const response = await s3Client.send(command);
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes'
      });
      
      response.Body.pipe(res);
      return;
    }


    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  
    if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
      res.writeHead(416, {
        'Content-Type': contentType,
        'Content-Range': `bytes */${fileSize}`
      });
      return res.end();
    }

    const chunkSize = (end - start) + 1;
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Range: `bytes=${start}-${end}`
    });
    const response = await s3Client.send(command);

    res.writeHead(206, {
      'Content-Type': contentType,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': chunkSize,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600'
    });

    response.Body.pipe(res);

  } catch (error) {
    console.error('S3 stream error:', error);
    if (!res.headersSent) {
      res.status(404).json({
        success: false,
        message: 'Video not found in S3'
      });
    }
  }
};

/**
 * Stream a video file with range support (Local or S3)
 * @param {string} filename - Name of the video file
 * @param {string} range - Range header from request (e.g., "bytes=0-1023")
 * @param {Object} res - Express response object
 */
export const streamVideo = async (filename, range, res) => {
  console.log(`\n🔍 STREAM VIDEO CALLED:`);
  console.log(`   Filename: ${filename}`);
  console.log(`   USE_S3: ${USE_S3}`);
  console.log(`   BUCKET_NAME: ${BUCKET_NAME}`);
  

  if (USE_S3) {
    const s3Key = `videos/${filename}`;
    console.log(`   S3 Key: ${s3Key}`);
    return streamVideoFromS3(s3Key, range, res);
  }
  
  const filePath = path.join(VIDEO_DIR, filename);
  
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }
  

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  
 
  const ext = path.extname(filename).toLowerCase();
  const contentType = getContentType(ext);
  
 
  if (!range) {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes'  
    });
    
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    
    return;
  }
  

  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  
  
  if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
    
    res.writeHead(416, {
      'Content-Type': contentType,
      'Content-Range': `bytes */${fileSize}`
    });
    return res.end();
  }
  
  
  const chunkSize = (end - start) + 1;
  
  
  res.writeHead(206, {
    'Content-Type': contentType,
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Content-Length': chunkSize,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600'
  });
  
  
  const stream = fs.createReadStream(filePath, { start, end });
  
  
  stream.on('error', (error) => {
    console.error('Stream error:', error);
    if (!res.headersSent) {
      res.status(500).end();
    }
  });
  
  
  stream.pipe(res);
};

/**
 * Get file information from S3
 * @param {string} key - S3 object key
 * @returns {Object} - File stats
 */
export const getVideoInfoFromS3 = async (key) => {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    const response = await s3Client.send(command);
    const filename = key.split('/').pop();
    const ext = path.extname(filename).toLowerCase();
    
    return {
      filename,
      key,
      size: response.ContentLength,
      contentType: response.ContentType || getContentType(ext),
      lastModified: response.LastModified,
      streamUrl: `/api/stream/${filename}`
    };
  } catch (error) {
    return null;
  }
};

/**
 * Get file information (Local or S3)
 * @param {string} filename - Video filename
 * @returns {Object} - File stats
 */
export const getVideoInfo = async (filename) => {
  if (USE_S3) {
    const key = `videos/${filename}`;
    return await getVideoInfoFromS3(key);
  }
  
  const filePath = path.join(VIDEO_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const stat = fs.statSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  
  return {
    filename,
    size: stat.size,
    createdAt: stat.birthtime,
    modifiedAt: stat.mtime,
    contentType: getContentType(ext)
  };
};

/**
 * List videos from S3
 * @returns {Array} - List of video files
 */
export const listVideosFromS3 = async () => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'videos/',
      MaxKeys: 100
    });
    const response = await s3Client.send(command);
    
    if (!response.Contents) return [];
    
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    
    const videos = await Promise.all(
      response.Contents
        .filter(obj => {
          const key = obj.Key;
          const ext = path.extname(key).toLowerCase();
          return videoExtensions.includes(ext);
        })
        .map(obj => getVideoInfoFromS3(obj.Key))
    );
    
    return videos.filter(v => v !== null);
  } catch (error) {
    console.error('S3 list error:', error);
    return [];
  }
};

/**
 * List all available videos (Local or S3)
 * @returns {Array} - List of video files
 */
export const listVideos = async () => {
  if (USE_S3) {
    return await listVideosFromS3();
  }
  
  const videoDir = VIDEO_DIR;
  
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
    return [];
  }
  
  const files = fs.readdirSync(videoDir);
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  
  const infoPromises = files
    .filter(file => videoExtensions.includes(path.extname(file).toLowerCase()))
    .map(file => getVideoInfo(file));
  
  const infos = await Promise.all(infoPromises);
  return infos.filter(info => info !== null);
};

/**
 * Get content type based on file extension
 * @param {string} ext - File extension
 * @returns {string} - MIME type
 */
const getContentType = (ext) => {
  const types = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.ogg': 'video/ogg'
  };
  
  return types[ext] || 'video/mp4';
};
