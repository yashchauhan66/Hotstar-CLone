/**
 * Debug Script for Streaming Service
 * Tests S3 connection and lists available videos
 */

import dotenv from 'dotenv';
dotenv.config();

import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';

console.log('🔍 DEBUG: Checking Streaming Service Setup\n');

// Check env vars
console.log('1. Environment Variables:');
console.log(`   AWS_REGION: ${process.env.AWS_REGION || '❌ MISSING'}`);
console.log(`   S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME || '❌ MISSING'}`);
console.log(`   AWS_ACCESS_KEY: ${process.env.AWS_ACCESS_KEY ? '✅ Set' : '❌ MISSING'}`);
console.log(`   AWS_SECRET_KEY: ${process.env.AWS_SECRET_KEY ? '✅ Set' : '❌ MISSING'}`);

if (!process.env.AWS_REGION || !process.env.S3_BUCKET_NAME) {
  console.log('\n❌ ERROR: Missing required environment variables!');
  console.log('   Make sure .env file exists with these values.\n');
  process.exit(1);
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// List videos
const checkS3 = async () => {
  try {
    console.log('\n2. S3 Connection Test...');
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'videos/',
      MaxKeys: 10
    });
    
    const response = await s3Client.send(command);
    console.log('   ✅ S3 Connected Successfully\n');
    
    console.log('3. Videos in S3:');
    if (!response.Contents || response.Contents.length === 0) {
      console.log('   ❌ No videos found in S3 bucket');
      console.log('   📁 Folder: videos/');
      console.log('\n💡 Upload a video first using:');
      console.log('   POST http://localhost:5003/api/upload');
    } else {
      response.Contents.forEach((obj, i) => {
        const filename = obj.Key.replace('videos/', '');
        const sizeMB = (obj.Size / (1024 * 1024)).toFixed(2);
        console.log(`\n   ${i + 1}. ${filename}`);
        console.log(`      Size: ${sizeMB} MB`);
        console.log(`      Stream URL: http://localhost:5005/api/stream/${filename}`);
        console.log(`      Player: http://localhost:5005/api/player/${filename}`);
      });
      
      console.log('\n✅ READY TO STREAM!');
      console.log(`\nTest URLs:`);
      const firstVideo = response.Contents[0].Key.replace('videos/', '');
      console.log(`   List:  http://localhost:5005/api/videos`);
      console.log(`   Info:  http://localhost:5005/api/info/${firstVideo}`);
      console.log(`   Stream: http://localhost:5005/api/stream/${firstVideo}`);
      console.log(`   Player: http://localhost:5005/api/player/${firstVideo}`);
    }
    
  } catch (error) {
    console.log(`\n   ❌ S3 Error: ${error.name}`);
    console.log(`   Message: ${error.message}`);
    
    if (error.name === 'NoSuchBucket') {
      console.log(`\n💡 Bucket "${BUCKET_NAME}" does not exist!`);
      console.log('   Create it in AWS S3 Console.');
    } else if (error.name === 'Forbidden') {
      console.log('\n💡 Access denied. Check your AWS credentials.');
    }
  }
};

checkS3();
