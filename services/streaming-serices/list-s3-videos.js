/**
 * List all videos in S3 bucket
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

const listVideos = async () => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'videos/',
      MaxKeys: 100
    });
    
    const response = await s3Client.send(command);
    
    console.log('📁 Videos in S3 bucket:\n');
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('❌ No videos found in S3');
      console.log(`\n💡 Upload a video first:`);
      console.log(`   POST http://localhost:5003/api/upload`);
      return;
    }
    
    response.Contents.forEach((obj, i) => {
      const filename = obj.Key.replace('videos/', '');
      const sizeMB = (obj.Size / (1024 * 1024)).toFixed(2);
      console.log(`${i + 1}. ${filename}`);
      console.log(`   Size: ${sizeMB} MB`);
      console.log(`   Stream URL: http://localhost:5005/api/stream/${filename}`);
      console.log(`   Player: http://localhost:5005/api/player/${filename}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

listVideos();
