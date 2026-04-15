import { createProxyMiddleware } from "http-proxy-middleware";

export const authProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE || 'http://auth-service:5001',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Auth Proxy Error:', err.message);
    res.status(502).json({ error: 'Auth service unavailable' });
  }
});

export const userProxy = createProxyMiddleware({
  target: process.env.USER_SERVICE || 'http://user-service:5002',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('User Proxy Error:', err.message);
    res.status(502).json({ error: 'User service unavailable' });
  }
});

export const videoProxy = createProxyMiddleware({
  target: process.env.VIDEO_SERVICE || 'http://video-service:5003',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Video Proxy Error:', err.message);
    res.status(502).json({ error: 'Video service unavailable' });
  }
});

export const streamingProxy = createProxyMiddleware({
  target: process.env.STREAMING_SERVICE || 'http://streaming-service:5005',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Streaming Proxy Error:', err.message);
    res.status(502).json({ error: 'Streaming service unavailable' });
  }
});

