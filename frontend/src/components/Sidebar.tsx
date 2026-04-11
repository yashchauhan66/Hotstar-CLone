import React from 'react';
import Link from 'next/link';
import { Home, Search, Tv, Film, UserCircle, Grid } from 'lucide-react';

const Sidebar: React.FC = () => {
    return (
        <aside className="fixed left-0 top-0 bottom-0 w-20 flex flex-col items-center py-6 bg-gradient-to-r from-black/90 to-transparent z-50 hover:w-64 hover:bg-black/95 transition-all duration-300 group">
            <div className="mb-10 opacity-70 group-hover:opacity-100 flex items-center justify-start w-full px-6">
                <Link href="/">
                    <div className="flex items-center cursor-pointer">
                        <img src="https://via.placeholder.com/30?text=H" alt="Logo" className="w-8 h-8 rounded-full shadow-lg" />
                        <span className="hidden group-hover:block ml-4 text-xl font-bold text-white tracking-wider">Hotstar</span>
                    </div>
                </Link>
            </div>

            <nav className="flex flex-col space-y-8 w-full px-6 flex-1">
                <Link href="/myspace" className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                    <UserCircle className="w-6 h-6 flex-shrink-0" />
                    <span className="hidden group-hover:block ml-6 text-sm font-semibold tracking-wide">My Space</span>
                </Link>
                <Link href="/search" className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                    <Search className="w-6 h-6 flex-shrink-0" />
                    <span className="hidden group-hover:block ml-6 text-sm font-semibold tracking-wide">Search</span>
                </Link>
                <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                    <Home className="w-6 h-6 flex-shrink-0 drop-shadow-md" />
                    <span className="hidden group-hover:block ml-6 text-sm font-semibold tracking-wide">Home</span>
                </Link>
                <Link href="/category/tv" className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                    <Tv className="w-6 h-6 flex-shrink-0" />
                    <span className="hidden group-hover:block ml-6 text-sm font-semibold tracking-wide">TV</span>
                </Link>
                <Link href="/category/movies" className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                    <Film className="w-6 h-6 flex-shrink-0" />
                    <span className="hidden group-hover:block ml-6 text-sm font-semibold tracking-wide">Movies</span>
                </Link>
                <Link href="/categories" className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                    <Grid className="w-6 h-6 flex-shrink-0" />
                    <span className="hidden group-hover:block ml-6 text-sm font-semibold tracking-wide">Categories</span>
                </Link>
            </nav>
        </aside>
    );
};

export default Sidebar;
