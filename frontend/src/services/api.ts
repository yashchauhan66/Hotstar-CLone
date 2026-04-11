import axios from 'axios';

// Auth Service API (port 5001)
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Video Service API (port 5003)
const videoApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_VIDEO_API_URL || 'http://localhost:5003',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Delete video API
export const deleteVideo = async (videoId: string) => {
  const token = localStorage.getItem('token');
  const response = await videoApi.delete(`/api/videos/${videoId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// User Service API (port 5002)
const userApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:5002',
  headers: {
    'Content-Type': 'application/json',
  },
});


authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

videoApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

userApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptors to handle errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

videoApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    authApi.post('/auth/login', { email, password }),

  register: (name: string, email: string, password: string, role: string = 'user') =>
    authApi.post('/auth/signup', { name, email, password, role }),

  logout: () =>
    authApi.post('/auth/logout'),

  refreshToken: () =>
    authApi.post('/auth/refresh'),

  getProfile: () =>
    authApi.get('/auth/profile'),
};

export const videoAPI = {
  getAllVideos: (category?: string) =>
    videoApi.get(`/api/videos${category ? `?category=${category}` : ''}`),

  getVideoById: (id: string) =>
    videoApi.get(`/api/videos/${id}`),

  getVideosByCategory: (category: string) =>
    videoApi.get(`/api/videos/category/${category}`),

  getTrendingVideos: () =>
    videoApi.get('/api/videos/trending'),

  getLatestVideos: () =>
    videoApi.get('/api/videos/latest'),

  searchVideos: (query: string) =>
    videoApi.get(`/api/videos/search?q=${encodeURIComponent(query)}`),

  getRecommendedVideos: () =>
    videoApi.get('/api/videos/recommended'),

  getTrendingMovies: () =>
    videoApi.get('/api/videos/trending-movies'),

  getPopularMovies: () =>
    videoApi.get('/api/videos/movies/popular'),

  getMovies: () =>
    videoApi.get('/api/videos/movies'),

  incrementViews: (id: string) =>
    videoApi.post(`/api/videos/${id}/views`),

  likeVideo: (id: string) =>
    videoApi.post(`/api/videos/${id}/like`),

  unlikeVideo: (id: string) =>
    videoApi.delete(`/api/videos/${id}/like`),

  addToWatchHistory: (id: string, progress: number) =>
    videoApi.post(`/api/videos/${id}/history`, { progress }),

  getWatchHistory: () =>
    videoApi.get('/api/videos/history'),

  addToFavorites: (id: string) =>
    videoApi.post(`/api/videos/${id}/favorite`),

  removeFromFavorites: (id: string) =>
    videoApi.delete(`/api/videos/${id}/favorite`),

  getFavorites: () =>
    videoApi.get('/api/videos/favorites'),
};

export const streamingAPI = {
  getStreamUrl: (videoId: string) => {
    const streamingBaseUrl = process.env.NEXT_PUBLIC_STREAMING_BASE_URL || 'http://localhost:5005/api/stream';
    return `${streamingBaseUrl}/${videoId}`;
  },

  getPlaylistUrl: (videoId: string) => {
    const streamingBaseUrl = process.env.NEXT_PUBLIC_STREAMING_BASE_URL || 'http://localhost:5005/api/stream';
    return `${streamingBaseUrl}/${videoId}?filename=index.m3u8`;
  },

  getSegmentUrl: (videoId: string, segment: string) => {
    const streamingBaseUrl = process.env.NEXT_PUBLIC_STREAMING_BASE_URL || 'http://localhost:5005/api/stream';
    return `${streamingBaseUrl}/${videoId}?filename=${segment}`;
  },
};

export const userAPI = {
  getProfile: () =>
    userApi.get('/api/users/profile'),

  createProfile: (data: { name: string; email: string; avatar?: string; preferences?: any }) =>
    userApi.post('/api/users/profile', data),

  updateProfile: (data: { name?: string; email?: string; avatar?: string; preferences?: any }) =>
    userApi.put('/api/users/profile', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return userApi.post('/api/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  addToHistory: (videoId: string) =>
    userApi.post('/api/users/history', { videoId }),
};

export default { authAPI, videoAPI, streamingAPI, userAPI };
