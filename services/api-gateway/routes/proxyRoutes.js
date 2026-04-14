import { createProxyMiddleware } from "http-proxy-middleware"
import dotenv from "dotenv"
dotenv.config();

export const authProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE || 'http://auth-service:5001',
  pathFilter: "/api/auth",
  changeOrigin: true,
  pathRewrite: {
    "^/api/auth": "/auth" 
  },
  onError: (err, req, res) => {
    console.error('Auth Proxy Error:', err.message);
    res.status(502).json({ error: 'Auth service unavailable' });
  }
})

export const userProxy = createProxyMiddleware({
  target: process.env.USER_SERVICE || 'http://user-service:5002',
  pathFilter: "/api/users",
  changeOrigin: true,
  pathRewrite: {
    "^/api/users": "/api/users" 
  },
  onError: (err, req, res) => {
    console.error('User Proxy Error:', err.message);
    res.status(502).json({ error: 'User service unavailable' });
  }
})

export const videoProxy = createProxyMiddleware({
  target: process.env.VIDEO_SERVICE || 'http://video-service:5003',
  pathFilter: "/api/videos",
  changeOrigin: true,
  pathRewrite: {
    "^/api/videos": "/api/videos" 
  },
  onError: (err, req, res) => {
    console.error('Video Proxy Error:', err.message);
    res.status(502).json({ error: 'Video service unavailable' });
  }
})

export const streamingProxy = createProxyMiddleware({
  target: process.env.STREAMING_SERVICE || 'http://streaming-service:5005',
  pathFilter: "/api/stream",
  changeOrigin: true,
  pathRewrite: {
    "^/api/stream": "/api/stream" 
  },
  onError: (err, req, res) => {
    console.error('Streaming Proxy Error:', err.message);
    res.status(502).json({ error: 'Streaming service unavailable' });
  }
})

