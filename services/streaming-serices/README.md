# Simple Streaming Service

A beginner-friendly video streaming service with **range request support** (for seeking/forward/backward).

## What This Service Does

1. **Streams video files** from local storage
2. **Supports partial content** (HTTP 206) - allows video seeking
3. **Sets proper headers** for video playback
4. **Works in any browser** with the native video player

## Project Structure

```
simple-streaming-service/
├── src/
│   ├── routes/
│   │   └── streamRoutes.js      # API endpoint definitions
│   ├── controllers/
│   │   └── streamController.js  # HTTP request handlers
│   ├── services/
│   │   └── streamService.js     # Video streaming logic
│   ├── videos/                  # Video storage folder
│   └── server.js               # Express application
├── .env.example                # Configuration template
├── package.json                # Dependencies
└── README.md                   # This guide
```

## How Range Requests Work

When you watch a video and click on the progress bar to jump forward, the browser sends a **Range header**:

```
Range: bytes=1048576-2097151
```

This tells the server: "Give me only bytes 1MB to 2MB of the file."

The server responds with:
- **HTTP 206 Partial Content** (not 200)
- **Content-Range: bytes 1048576-2097151/10485760** (showing what we're sending)
- Only that chunk of the video

This allows:
- ✅ Instant seeking (no need to download whole video)
- ✅ Resuming interrupted downloads
- ✅ Efficient bandwidth usage

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd simple-streaming-service
npm install
```

### 2. Add Your Videos

Put video files in the `src/videos/` folder:

```bash
mkdir -p src/videos
cp ~/Downloads/your-video.mp4 src/videos/
```

### 3. Start the Server

```bash
npm run dev
```

You should see:
```
🎬 Streaming service running on http://localhost:5005
📁 Video storage: ./src/videos

Test URLs:
- List videos:    http://localhost:5005/api/videos
- Stream video:   http://localhost:5005/api/stream/your-video.mp4
- Video player:   http://localhost:5005/api/player/your-video.mp4
```

## API Endpoints

### 1. List All Videos
```
GET http://localhost:5005/api/videos
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "filename": "sample.mp4",
      "size": 52428800,
      "contentType": "video/mp4",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. Stream Video (Most Important)
```
GET http://localhost:5005/api/stream/sample.mp4
```

**Request Headers:**
```
Range: bytes=0-1023    (optional - browser sends this when seeking)
```

**Response Headers (Full File):**
```
HTTP/1.1 200 OK
Content-Type: video/mp4
Content-Length: 52428800
Accept-Ranges: bytes
```

**Response Headers (Partial Content):**
```
HTTP/1.1 206 Partial Content
Content-Type: video/mp4
Content-Range: bytes 0-1023/52428800
Content-Length: 1024
Accept-Ranges: bytes
```

### 3. Get Video Info
```
GET http://localhost:5005/api/info/sample.mp4
```

### 4. Web Player Page
```
GET http://localhost:5005/api/player/sample.mp4
```

Opens an HTML page with a video player.

## Testing in Browser

### Method 1: Direct URL
Simply paste the stream URL in your browser:
```
http://localhost:5005/api/stream/sample.mp4
```

Most browsers will play the video natively.

### Method 2: HTML Video Player
Create a simple HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Video Player</title>
</head>
<body>
  <video controls width="640">
    <source src="http://localhost:5005/api/stream/sample.mp4" type="video/mp4">
  </video>
</body>
</html>
```

Open this file in your browser. Try:
- ▶️ Play/Pause
- ⏯️ Click on the progress bar to seek
- 🔊 Volume control
- ⛶ Fullscreen

### Method 3: Built-in Player
Use the built-in player page:
```
http://localhost:5005/api/player/sample.mp4
```

## Testing with curl

### Test Full File Stream
```bash
curl -I http://localhost:5005/api/stream/sample.mp4
```

Look for: `Accept-Ranges: bytes`

### Test Partial Content (Range Request)
```bash
curl -H "Range: bytes=0-1023" http://localhost:5005/api/stream/sample.mp4 -o chunk.mp4
```

You should get a small 1KB file (just the first chunk).

### Test Video Info
```bash
curl http://localhost:5005/api/info/sample.mp4
```

## Code Explanation

### Stream Service Key Logic

```javascript
// 1. Check if client wants a specific range
const range = req.headers.range;  // "bytes=1048576-2097151"

// 2. No range? Send full file (200 OK)
if (!range) {
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Content-Length': fileSize,
    'Accept-Ranges': 'bytes'
  });
  fs.createReadStream(filePath).pipe(res);
}

// 3. Has range? Send partial content (206)
else {
  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parseInt(parts[1], 10);
  
  res.writeHead(206, {
    'Content-Type': 'video/mp4',
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Content-Length': end - start + 1,
    'Accept-Ranges': 'bytes'
  });
  
  // Stream only the requested bytes
  fs.createReadStream(filePath, { start, end }).pipe(res);
}
```

### Why This Approach?

| Feature | How It's Implemented |
|---------|---------------------|
| Memory Efficient | Uses `fs.createReadStream()` - streams chunks instead of loading entire file |
| Supports Seeking | Handles `Range` header with HTTP 206 response |
| Fast Start | Browser requests only what it needs, video plays immediately |
| Standard Compliant | Follows HTTP/1.1 Range Requests specification |

## Common Issues & Solutions

### 1. "Video not found"
**Solution**: Check if video exists in `src/videos/` folder
```bash
ls src/videos/
```

### 2. Video doesn't play
**Solution**: Check file extension is supported
- Supported: `.mp4`, `.webm`, `.mov`, `.avi`, `.mkv`
- Use `.mp4` for best browser compatibility

### 3. Seeking doesn't work
**Solution**: Verify `Accept-Ranges: bytes` header is present
```bash
curl -I http://localhost:5005/api/stream/sample.mp4
```

### 4. CORS errors in browser
**Solution**: Already enabled in server with `app.use(cors())`

## How to Extend This

### Add S3 Support
Replace `fs.createReadStream` with AWS SDK:
```javascript
import { GetObjectCommand } from '@aws-sdk/client-s3';
const response = await s3Client.send(new GetObjectCommand({
  Bucket: bucket,
  Key: key,
  Range: range  // Forward range to S3
}));
response.Body.pipe(res);
```

### Add Multiple Resolutions
Create folders like:
```
videos/
├── 1080p/
│   └── sample.mp4
├── 720p/
│   └── sample.mp4
└── 480p/
    └── sample.mp4
```

Let client choose quality.

### Add Thumbnails
Generate thumbnail on first request:
```javascript
import ffmpeg from 'fluent-ffmpeg';
ffmpeg(filePath).screenshots({
  count: 1,
  folder: 'thumbnails/',
  filename: `${filename}.jpg`
});
```

## Production Checklist

Before deploying:

- [ ] Use environment variables for paths
- [ ] Add rate limiting (prevent abuse)
- [ ] Add caching headers
- [ ] Use CDN for static files (CloudFront)
- [ ] Add authentication (JWT)
- [ ] Implement proper logging
- [ ] Add monitoring/metrics
- [ ] Use HTTPS
- [ ] Set up video compression

## Key Takeaways

1. **Range Requests** are essential for video streaming - they enable seeking
2. **HTTP 206** is the status code for partial content
3. **Node.js streams** (`createReadStream`) prevent memory issues with large files
4. **Proper headers** (`Accept-Ranges`, `Content-Range`) tell browsers they can seek

This is how Netflix, YouTube, and every major video platform works at a basic level!
