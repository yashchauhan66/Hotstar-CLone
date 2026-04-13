import axios from 'axios';


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://3.110.49.32:5000';


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

  deleteVideo: async (videoId: string) => {
    const response = await videoApi.delete(`/api/videos/${videoId}`);
    return response.data;
  },

  likeVideo: (id: string) =>
    videoApi.post(`/api/videos/${id}/like`),

  unlikeVideo: (id: string) =>
    videoApi.delete(`/api/videos/${id}/like`),

  getTrendingVideos: () =>
    videoApi.get('/api/videos/trending'),
};


export const userAPI = {
  getProfile: () =>
    userApi.get('/api/users/profile'),

  updateProfile: (data: any) =>
    userApi.put('/api/users/profile', data),
};



export const streamingAPI = {
  getStreamUrl: (videoId: string) => {
    const base = process.env.NEXT_PUBLIC_STREAMING_BASE_URL || 'http://3.110.49.32:5005/api/stream';
    return `${base}/${videoId}`;
  },
};

export default { authAPI, videoAPI, streamingAPI, userAPI };
