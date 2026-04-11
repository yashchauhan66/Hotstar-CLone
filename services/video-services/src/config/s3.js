
 

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();


const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file data
 * @param {string} fileName - Original filename (to get extension)
 * @param {string} mimeType - File type (e.g., 'video/mp4')
 * @returns {Promise<string>} - The S3 URL of the uploaded file
 */
export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  try {
    
    const uniqueId = uuidv4();
    const extension = fileName.split('.').pop();
    const key = `videos/${uniqueId}.${extension}`;
    

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });
    
    
    await s3Client.send(command);
    
    const videoUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    
    console.log(` File uploaded to S3: ${key}`);
    
    return videoUrl;
    
  } catch (error) {
    console.error(' S3 upload failed:', error.message);
    throw error;
  }
};

/**
 * Upload a thumbnail image to S3
 * @param {Buffer} fileBuffer - The image file data
 * @param {string} fileName - Original filename (to get extension)
 * @param {string} mimeType - Image type (e.g., 'image/jpeg')
 * @returns {Promise<string>} - The S3 URL of the uploaded thumbnail
 */
export const uploadThumbnailToS3 = async (fileBuffer, fileName, mimeType) => {
  try {
    const uniqueId = uuidv4();
    const extension = fileName.split('.').pop();
    const key = `thumbnails/${uniqueId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    const thumbnailUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    console.log(`🖼️ Thumbnail uploaded to S3: ${key}`);

    return thumbnailUrl;

  } catch (error) {
    console.error('❌ S3 thumbnail upload failed:', error.message);
    throw error;
  }
};

export { s3Client };
