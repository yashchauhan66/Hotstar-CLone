import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { searchVideos } from '../store/slices/videoSlice';
import Sidebar from '../components/Sidebar';
import VideoCard from '../components/VideoCard';
import { Search as SearchIcon } from 'lucide-react';

const SearchPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [searchInput, setSearchInput] = useState('');
    const [debouncedInput, setDebouncedInput] = useState('');

    const { searchResults, isLoading } = useSelector((state: RootState) => state.videos);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedInput(searchInput);
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchInput]);

    useEffect(() => {
        if (debouncedInput.trim().length > 0) {
            dispatch(searchVideos(debouncedInput));
        }
    }, [debouncedInput, dispatch]);

    return (
        <div className="min-h-screen bg-primary-100 flex overflow-hidden text-white font-sans">
            <Sidebar />
            <main className="flex-1 w-full pl-20 overflow-y-auto no-scrollbar pt-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="relative max-w-2xl mx-auto mb-12">
                        <div className="relative bg-primary-200/50 rounded-lg overflow-hidden border-b-2 border-transparent focus-within:border-accent-500 transition-colors">
                            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-primary-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Movies, shows and more"
                                className="w-full bg-transparent text-white text-xl md:text-2xl py-4 pl-14 pr-4 focus:outline-none placeholder-primary-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center mt-20">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-accent-500 rounded-full animate-spin" />
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div>
                            <h2 className="text-xl font-bold mb-6 text-primary-300">Results for "{debouncedInput}"</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {searchResults.map((video) => (
                                    <VideoCard key={video._id} video={video} size="small" />
                                ))}
                            </div>
                        </div>
                    ) : debouncedInput.length > 0 ? (
                        <div className="text-center mt-20">
                            <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
                            <p className="text-primary-400">Try searching for a different keyword or title.</p>
                        </div>
                    ) : (
                        <div className="text-center mt-20">
                            <h2 className="text-2xl font-bold text-primary-400 opacity-50">Search for your favorite content</h2>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default SearchPage;
