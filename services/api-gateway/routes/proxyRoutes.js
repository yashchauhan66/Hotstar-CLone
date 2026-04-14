import { createProxyMiddleware } from "http-proxy-middleware";


export const authProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE || "http://auth-service:5001",
  changeOrigin: true,
  pathRewrite: {
    "^/api/auth": "/auth"
  },
  logLevel: "debug"
});


export const userProxy = createProxyMiddleware({
  target: process.env.USER_SERVICE || "http://user-service:5002",
  changeOrigin: true,
  pathRewrite: {
    "^/api/users": "/users"
  }
});


export const videoProxy = createProxyMiddleware({
  target: process.env.VIDEO_SERVICE || "http://video-service:5003",
  changeOrigin: true,
  pathRewrite: {
    "^/api/videos": "/videos"
  }
});


export const streamingProxy = createProxyMiddleware({
  target: process.env.STREAMING_SERVICE || "http://streaming-service:5005",
  changeOrigin: true,
  pathRewrite: {
    "^/api/stream": "/stream"
  }
});
