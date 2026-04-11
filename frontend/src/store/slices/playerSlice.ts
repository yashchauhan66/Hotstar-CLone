import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  currentVideo: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  quality: string;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  playbackSpeed: number;
  buffered: number;
  subtitles: boolean;
  isMuted: boolean;
}

const initialState: PlayerState = {
  currentVideo: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  quality: 'auto',
  isFullscreen: false,
  isLoading: false,
  error: null,
  playbackSpeed: 1,
  buffered: 0,
  subtitles: false,
  isMuted: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setVideo: (state, action: PayloadAction<any>) => {
      state.currentVideo = action.payload;
      state.currentTime = 0;
      state.isPlaying = false;
      state.error = null;
    },
    play: (state) => {
      state.isPlaying = true;
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
      state.isMuted = action.payload === 0;
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    setQuality: (state, action: PayloadAction<string>) => {
      state.quality = action.payload;
    },
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackSpeed = action.payload;
    },
    setBuffered: (state, action: PayloadAction<number>) => {
      state.buffered = action.payload;
    },
    toggleSubtitles: (state) => {
      state.subtitles = !state.subtitles;
    },
    seek: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    forward: (state) => {
      state.currentTime = Math.min(state.currentTime + 10, state.duration);
    },
    rewind: (state) => {
      state.currentTime = Math.max(state.currentTime - 10, 0);
    },
    reset: (state) => {
      return initialState;
    },
  },
});

export const {
  setVideo,
  play,
  pause,
  togglePlay,
  setCurrentTime,
  setDuration,
  setVolume,
  toggleMute,
  setQuality,
  toggleFullscreen,
  setLoading,
  setError,
  setPlaybackSpeed,
  setBuffered,
  toggleSubtitles,
  seek,
  forward,
  rewind,
  reset,
} = playerSlice.actions;

export default playerSlice.reducer;
