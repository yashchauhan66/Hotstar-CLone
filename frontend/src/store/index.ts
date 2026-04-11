import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import videoSlice from './slices/videoSlice';
import playerSlice from './slices/playerSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    videos: videoSlice,
    player: playerSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
