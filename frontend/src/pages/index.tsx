import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { RootState, AppDispatch } from '../store';
import Banner from '../components/Banner';
import TrendingVideos from '../components/TrendingVideos';
import VideoGrid from '../components/VideoGrid';
import { videoAPI } from '../services/api';
import { 
  fetchVideos, 
  fetchBannerVideo 
} from '../store/slices/videoSlice';

const HomePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  const {
    videos,
    isLoading,
    selectedTab,
    bannerVideo,
    isBannerLoading
  } = useSelector((state: RootState) => state.videos);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);


  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchVideos());
    }
  }, [dispatch, isAuthenticated]);


  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchBannerVideo(selectedTab));
    }
  }, [dispatch, isAuthenticated, selectedTab]);

  const handleDeleteVideo = async (videoId: string) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await videoAPI.deleteVideo(videoId);
      // Refresh videos after deletion
      dispatch(fetchVideos());
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0f0f0f] text-white"
    >
      <main className="w-full">
        {/* Admin Upload Button */}
        {isAdmin && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => router.push('/upload')}
              className="bg-[#00A8E1] hover:bg-[#0092c4] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <span>+</span> Upload Video
            </button>
          </div>
        )}

        <section className="relative z-0 min-h-[85vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {isBannerLoading ? (
                <Banner loading={true} />
              ) : (
                <Banner video={bannerVideo || (videos[0])} />
              )}
            </motion.div>
          </AnimatePresence>
        </section>

      
        <div className="relative z-10 -mt-24 lg:-mt-40 space-y-4 pb-20">

          {/* Trending Section - Top 4 latest videos */}
          <TrendingVideos
            videos={videos}
            loading={isLoading}
            isAdmin={isAdmin}
            onDeleteVideo={handleDeleteVideo}
            maxItems={4}
          />

          {/* All Videos Section */}
          <VideoGrid
            videos={videos}
            loading={isLoading}
            isAdmin={isAdmin}
            onDeleteVideo={handleDeleteVideo}
          />

          <footer className="py-20 flex flex-col items-center justify-center opacity-20">
            <div className="text-3xl font-black tracking-widest">HOTSTAR</div>
          </footer>
        </div>
      </main>
    </motion.div>
  );
};

export default HomePage;
