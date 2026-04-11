import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { videoAPI } from '../../services/api';

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  streamingUrl: string;
  category: string;
  tags: string[];
  duration: number;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface VideoState {
  videos: Video[];
  currentVideo: Video | null;
  trending: Video[];
  latest: Video[];
  recommended: Video[];
  isLoading: boolean;
  error: string | null;
  searchResults: Video[];
  searchQuery: string;
  selectedTab: 'home' | 'tv' | 'movie' | 'sports';
  bannerVideo: Video | null;
  isBannerLoading: boolean;
}

const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  trending: [],
  latest: [],
  recommended: [],
  isLoading: false,
  error: null,
  searchResults: [],
  searchQuery: '',
  selectedTab: 'home',
  bannerVideo: null,
  isBannerLoading: false,
};

export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoAPI.getAllVideos();
      return response.data.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch videos');
    }
  }
);

export const fetchBannerVideo = createAsyncThunk(
  'videos/fetchBannerVideo',
  async (type: string, { rejectWithValue }) => {
    try {
     
      const category = type === 'home' ? undefined : type;
      const response = await videoAPI.getAllVideos(category);
     
      return (response.data.data || response.data)[0] || null;
    } catch (error: any) {
      return rejectWithValue('Banner fetch failed');
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  'videos/fetchVideoById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await videoAPI.getVideoById(id);
      return response.data.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Video not found');
    }
  }
);

export const fetchTrendingVideos = createAsyncThunk(
  'videos/fetchTrendingVideos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoAPI.getAllVideos();
      return response.data.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending videos');
    }
  }
);

export const fetchLatestVideos = createAsyncThunk(
  'videos/fetchLatestVideos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoAPI.getAllVideos();
      return response.data.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch latest videos');
    }
  }
);

export const fetchRecommendedVideos = createAsyncThunk(
  'videos/fetchRecommendedVideos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoAPI.getAllVideos();
      return response.data.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommended videos');
    }
  }
);

export const incrementViews = createAsyncThunk(
  'videos/incrementViews',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await videoAPI.incrementViews(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to increment views');
    }
  }
);

export const searchVideos = createAsyncThunk(
  'videos/searchVideos',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await videoAPI.searchVideos(query);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const likeVideo = createAsyncThunk(
  'videos/likeVideo',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await videoAPI.likeVideo(id);
      return { id, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like video');
    }
  }
);

export const unlikeVideo = createAsyncThunk(
  'videos/unlikeVideo',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await videoAPI.unlikeVideo(id);
      return { id, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unlike video');
    }
  }
);

export const addToWatchHistory = createAsyncThunk(
  'videos/addToWatchHistory',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await videoAPI.addToWatchHistory(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to history');
    }
  }
);

export const fetchWatchHistory = createAsyncThunk(
  'videos/fetchWatchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoAPI.getWatchHistory();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'videos/addToFavorites',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await videoAPI.addToFavorites(id);
      return { id, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to favorites');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'videos/removeFromFavorites',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await videoAPI.removeFromFavorites(id);
      return { id, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from favorites');
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'videos/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoAPI.getFavorites();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites');
    }
  }
);

export const fetchMovies = createAsyncThunk(
  'videos/fetchMovies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoAPI.getMovies();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch movies');
    }
  }
);

export const fetchPopularMovies = createAsyncThunk(
  'videos/fetchPopularMovies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoAPI.getPopularMovies();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch popular movies');
    }
  }
);

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    setSelectedTab: (state, action: PayloadAction<'home' | 'tv' | 'movie' | 'sports'>) => {
      state.selectedTab = action.payload;
    },
    resetPlayer: (state) => {
      state.currentVideo = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = action.payload;

        
        state.trending = [...action.payload]
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);
        state.latest = [...action.payload]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
        state.recommended = [...action.payload]
          .sort(() => 0.5 - Math.random())
          .slice(0, 10);
      })
      .addCase(fetchBannerVideo.pending, (state) => {
        state.isBannerLoading = true;
      })
      .addCase(fetchBannerVideo.fulfilled, (state, action) => {
        state.isBannerLoading = false;
        state.bannerVideo = action.payload;
      })
      .addCase(fetchBannerVideo.rejected, (state) => {
        state.isBannerLoading = false;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.currentVideo = action.payload;
      })
      .addCase(searchVideos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchVideos.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(likeVideo.fulfilled, (state, action) => {
        if (state.currentVideo && state.currentVideo._id === action.payload.id) {
          state.currentVideo.likes += 1;
        }
      })
      .addCase(unlikeVideo.fulfilled, (state, action) => {
        if (state.currentVideo && state.currentVideo._id === action.payload.id) {
          state.currentVideo.likes = Math.max(0, state.currentVideo.likes - 1);
        }
      });
  },
});

export const { setSelectedTab, resetPlayer, setSearchQuery, clearSearchResults } = videoSlice.actions;
export default videoSlice.reducer;
