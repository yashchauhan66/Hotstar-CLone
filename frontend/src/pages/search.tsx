import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { videoAPI } from '../services/api';
import VideoCard from '../components/VideoCard';
import { Loader2, Search as SearchIcon, Film } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchPage: React.FC = () => {
  const router = useRouter();
  const { q } = router.query;
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (q) {
      performSearch(q as string);
    }
  }, [q]);

  const performSearch = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await videoAPI.searchVideos(query);
      if (response.data && response.data.success) {
        setResults(response.data.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-28 pb-12 px-6 md:px-12">
      <div className="max-w-[1920px] mx-auto">
        <header className="mb-12">
          <div className="flex items-center space-x-4 text-white/40 mb-2">
            <SearchIcon size={18} />
            <span className="text-sm font-bold tracking-[0.2em] uppercase">Search Results</span>
          </div>
          <h1 className="text-4xl font-black text-white">
            Showing results for <span className="text-[#00A8E1]">"{q}"</span>
          </h1>
          <p className="mt-2 text-white/40">Found {results.length} titles matching your query</p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <Loader2 className="animate-spin text-[#00A8E1]" size={48} />
            <p className="text-white/20 font-bold tracking-widest text-xs uppercase">Scouring the archives...</p>
          </div>
        ) : results.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
          >
            {results.map((video) => (
              <VideoCard
                key={video._id}
                id={video._id}
                title={video.title}
                thumbnail={video.thumbnail}
                views={video.views}
                duration={video.duration}
                category={video.category}
              />
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
              <Film size={40} className="text-white/10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">No results found</h3>
              <p className="text-white/40 max-w-md">
                We couldn't find any matches for "{q}". Try checking your spelling or use more general keywords.
              </p>
            </div>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/5"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
