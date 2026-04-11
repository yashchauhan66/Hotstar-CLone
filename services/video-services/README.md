# Simple Video Service

A beginner-friendly Video Upload Service built with Node.js, Express, MongoDB, and AWS S3.

## What This Service Does

1. **Accepts video uploads** from users
2. **Stores videos** in AWS S3 (cloud storage)
3. **Saves metadata** in MongoDB (title, URL, etc.)
4. **Returns video URLs** that can be played in the browser

## Project Structure

```
simple-video-service/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection setup
│   │   └── s3.js           # AWS S3 configuration
│   ├── controllers/
│   │   └── videoController.js  # Handle HTTP requests
│   ├── middlewares/
│   │   └── uploadMiddleware.js # File upload handling
│   ├── models/
│   │   └── Video.js        # Database schema
│   ├── routes/
│   │   └── videoRoutes.js    # API endpoint definitions
│   ├── services/
│   │   └── uploadService.js   # Business logic
│   └── server.js           # Main application entry
├── uploads/               # Temporary storage (if needed)
├── .env.example          # Environment variables template
├── package.json          # Dependencies
└── README.md            # This file
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd simple-video-service
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PORT=5003
MONGODB_URI=mongodb://localhost:27017/simple-video-service
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-actual-access-key
AWS_SECRET_ACCESS_KEY=your-actual-secret-key
S3_BUCKET_NAME=your-bucket-name
```

### 3. Prerequisites

**MongoDB**: Install and start MongoDB locally
- Windows: Use MongoDB Compass or install MongoDB Community
- Mac: `brew install mongodb-community` then `brew services start mongodb-community`
- Or use MongoDB Atlas (cloud) - free tier available

**AWS S3**: Create a bucket
1. Go to AWS Console → S3
2. Create bucket (remember the name)
3. Get your Access Key and Secret Key from IAM
4. Make sure the bucket allows public read access (or use pre-signed URLs)

### 4. Start the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Or production mode
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:5003
```

## API Endpoints

### 1. Upload Video
```
POST http://localhost:5003/api/upload
Content-Type: multipart/form-data

Form Fields:
- video: (file) The video file
- title: (string) Video title
```

**Success Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "id": "6568a2b3c4d5e6f7a8b9c0d1",
    "title": "My Awesome Video",
    "videoUrl": "https://my-bucket.s3.us-east-1.amazonaws.com/videos/123456.mp4",
    "status": "uploaded",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Videos
```
GET http://localhost:5003/api/videos
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "6568a2b3c4d5e6f7a8b9c0d1",
      "title": "My Video",
      "videoUrl": "https://...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Single Video
```
GET http://localhost:5003/api/videos/:id
```

### 4. Health Check
```
GET http://localhost:5003/health
```

## Testing with Postman

### Step 1: Create a New Request
1. Open Postman
2. Click "New" → "HTTP Request"
3. Set method to `POST`
4. Enter URL: `http://localhost:5003/api/upload`

### Step 2: Configure the Request
1. Go to the **Body** tab
2. Select **form-data**
3. Add two fields:
   - Key: `video` | Type: **File** | Value: *Select your video file*
   - Key: `title` | Type: **Text** | Value: `My Test Video`

### Step 3: Send the Request
Click **Send**

### Step 4: Verify the Response
You should get a JSON response with:
- `success: true`
- `videoUrl` (S3 URL)
- `id` (MongoDB document ID)

### Step 5: Test Other Endpoints

**Get all videos:**
- Method: `GET`
- URL: `http://localhost:5003/api/videos`

**Get specific video:**
- Method: `GET`
- URL: `http://localhost:5003/api/videos/YOUR_VIDEO_ID`

## Code Explanation

### 1. File Upload Flow

```
Client (Postman)
    ↓ POST /api/upload
Multer Middleware (validates file type & size)
    ↓
Video Controller (receives file)
    ↓
Upload Service (coordinates upload)
    ↓
S3 Config (uploads to AWS S3)
    ↓
Video Model (saves to MongoDB)
    ↓
Response sent to client
```

### 2. Key Components

**Multer**: Handles file uploads
- Stores files in memory (not disk) for immediate S3 upload
- Validates file types (only videos allowed)
- Limits file size

**AWS SDK v3**: Uploads to S3
- Generates unique filenames using UUID
- Returns public S3 URLs

**Mongoose**: Database operations
- Defines schema for video documents
- Provides methods to query/save data

### 3. Error Handling

The service handles these errors:
- No file provided → 400 Bad Request
- Invalid file type → 400 Bad Request
- File too large → 400 Bad Request
- Database errors → 500 Internal Server Error
- Video not found → 404 Not Found

## Common Issues & Solutions

### 1. "Cannot connect to MongoDB"
**Solution**: Make sure MongoDB is running
```bash
# Check if MongoDB is running
mongosh

# If not, start it
mongod
```

### 2. "S3 upload failed"
**Solution**: Check your AWS credentials
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Ensure the S3 bucket exists
- Check if the bucket region matches `AWS_REGION`

### 3. "File too large"
**Solution**: Increase limit in `.env`
```env
MAX_FILE_SIZE=500000000  # 500MB
```

### 4. CORS errors in browser
**Solution**: The service already includes CORS middleware. If testing from a frontend, make sure your domain is allowed.

## Next Steps (Future Enhancements)

This is a solid foundation. You can extend it with:

1. **Video Processing**: Add FFmpeg to convert videos to different formats
2. **Thumbnails**: Generate preview images
3. **Authentication**: Add user login/registration
4. **Pagination**: For large video lists
5. **Search**: Find videos by title
6. **Categories**: Organize videos by genre
7. **Streaming**: Use HLS for adaptive bitrate streaming

## Production Checklist

Before deploying to production:

- [ ] Use environment variables (never commit secrets)
- [ ] Enable MongoDB authentication
- [ ] Use IAM roles instead of access keys (on AWS)
- [ ] Add rate limiting
- [ ] Enable HTTPS
- [ ] Add input validation
- [ ] Set up logging
- [ ] Configure backup policies

## License

MIT - Free to use for learning and building!
