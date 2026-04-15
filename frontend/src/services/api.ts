import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://3.7.114.115:5000';
const STREAM_BASE_URL =
  process.env.NEXT_PUBLIC_STREAMING_BASE_URL || 'http://3.7.114.115:5000/api/stream';

const commonConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const authApi = axios.create({
  baseURL: BASE_URL,
  ...commonConfig,
});

const videoApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  ...commonConfig,
});

const userApi = axios.create({
  baseURL: BASE_URL,
  ...commonConfig,
});

const attachToken = (config: any) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

authApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));
videoApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));
userApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));

const handleAuthError = (error: any) => {
  if (error.response?.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

authApi.interceptors.response.use((res) => res, handleAuthError);
videoApi.interceptors.response.use((res) => res, handleAuthError);
userApi.interceptors.response.use((res) => res, handleAuthError);

// ================= AUTH API =================
export const authAPI = {
  login: (email: string, password: string) =>
    authApi.post('/api/auth/login', { email, password }),

  register: (name: string, email: string, password: string, role: string = 'user') =>
    authApi.post('/api/auth/signup', { name, email, password, role }),

  logout: () =>
    authApi.post('/api/auth/logout'),

  refreshToken: () =>
    authApi.post('/api/auth/refresh'),

  getProfile: () =>
    authApi.get('/api/auth/profile'),
};

export const videoAPI = {
  getAllVideos: (category?: string) =>
    videoApi.get(`/api/videos${category ? `?category=${category}` : ''}`),

  getVideoById: (id: string) => videoApi.get(`/api/videos/${id}`),

  deleteVideo: async (videoId: string) => {
    const response = await videoApi.delete(`/api/videos/delete/${videoId}`);
    return response.data;
  },

  likeVideo: (id: string) => videoApi.post(`/api/videos/${id}/like`),

  unlikeVideo: (id: string) => videoApi.delete(`/api/videos/${id}/like`),

  getTrendingVideos: () => videoApi.get('/api/videos/trending'),

  searchVideos: (query: string) =>
    videoApi.get(`/api/videos/search?q=${query}`),

  addComment: (videoId: string, text: string, userName?: string, userAvatar?: string) =>
    videoApi.post('/api/videos/comments', { videoId, text, userName, userAvatar }),

  getVideoComments: (videoId: string) =>
    videoApi.get(`/api/videos/${videoId}/comments`),

  deleteComment: (commentId: string) =>
    videoApi.delete(`/api/videos/comments/${commentId}`),
};

export const userAPI = {
  getProfile: () => userApi.get('/api/users/profile'),

  updateProfile: (data: any) => userApi.put('/api/users/profile', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return userApi.post('/api/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const streamingAPI = {
  getStreamUrl: (videoId: string) => {
    return `${STREAM_BASE_URL}/stream/${videoId}`;
  },
};

export default { authAPI, videoAPI, streamingAPI, userAPI };
