import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, LogOut, Menu, X, Bell, ChevronDown, Upload, Settings } from 'lucide-react';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { setSelectedTab } from '../store/slices/videoSlice';
import { userAPI } from '../services/api';

const Navbar: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { selectedTab } = useSelector((state: RootState) => state.videos);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile to get avatar
  useEffect(() => {
    if (isAuthenticated) {
      userAPI.getProfile()
        .then(response => {
          if (response.data && response.data.avatar) {
            // Construct full avatar URL if it's a relative path
            const avatarUrl = response.data.avatar.startsWith('http')
              ? response.data.avatar
              : `http://localhost:5002${response.data.avatar}`;
            setUserProfile({ ...response.data, avatar: avatarUrl });
          } else {
            setUserProfile(response.data);
          }
        })
        .catch(err => {
          console.log('Profile not found or error:', err);
        });
    }
  }, [isAuthenticated]);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'TV', id: 'tv' },
    { name: 'Movies', id: 'movie' },
    { name: 'Sports', id: 'sports' },
  ];

  const handleTabClick = (tabId: string) => {
    dispatch(setSelectedTab(tabId as any));
    if (router.pathname !== '/') {
      router.push('/');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center transition-all duration-500 px-6 md:px-12 ${isScrolled ? 'nav-blur shadow-2xl py-2 h-16' : 'bg-gradient-to-b from-black/80 to-transparent h-20'}`}
    >
      <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">

        {/* Left: Logo & Navigation */}
        <div className="flex items-center space-x-12">
          <button onClick={() => handleTabClick('home')} className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-[#00A8E1] rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white font-black text-2xl tracking-tighter">H</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-widest hidden md:block text-shadow">HOTSTAR</span>
          </button>

          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleTabClick(link.id)}
                className={`relative text-sm font-semibold tracking-widest transition-colors duration-300 py-2 group ${selectedTab === link.id ? 'text-[#00A8E1]' : 'text-white'
                  }`}
              >
                {link.name.toUpperCase()}
                {selectedTab === link.id && (
                  <motion.div
                    layoutId="navTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A8E1] shadow-[0_0_8px_#00A8E1]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Actions - Remains the same */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-white/80 hover:text-[#00A8E1] transition-colors"
          >
            <Search size={22} />
          </button>

          <Bell size={22} className="text-white/80 hover:text-[#00A8E1] transition-colors cursor-pointer hidden md:block" />

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {/* Upload Button - Admin Only */}
              {user?.role === 'admin' && router.pathname !== '/upload' && (
                <Link href="/upload">
                  <button className="flex items-center space-x-2 bg-[#00A8E1] hover:bg-[#0092c4] text-white px-4 py-2 rounded-lg transition-all transform active:scale-95">
                    <Upload size={18} />
                    <span className="text-sm font-bold">Upload</span>
                  </button>
                </Link>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-[#00A8E1] to-[#6c5ce7] rounded-full flex items-center justify-center border-2 border-white/10 group-hover:border-[#00A8E1]/50 transition-all overflow-hidden">
                    {userProfile?.avatar ? (
                      <img
                        src={userProfile.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={18} className="text-white" />
                    )}
                  </div>
                  <ChevronDown size={14} className={`text-white/60 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-56 glass-effect rounded-xl overflow-hidden shadow-3xl"
                  >
                    <div className="p-4 border-b border-white/5">
                      <div className="flex items-center space-x-3">
                        {userProfile?.avatar && (
                          <img
                            src={userProfile.avatar}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{userProfile?.name || user?.name || user?.email}</p>
                          <p className="text-[10px] text-[#00A8E1] font-bold tracking-widest mt-1">PREMIUM USER</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link href="/profile">
                        <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-all mb-1">
                          <Settings size={16} />
                          <span>Profile Settings</span>
                        </button>
                      </Link>
                      <button onClick={() => dispatch(logout())} className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </div>
          ) : (
            <Link href="/login">
              <button className="px-6 py-2 bg-[#00A8E1] hover:bg-[#0092c4] text-white text-sm font-bold rounded-lg transition-all transform active:scale-95 shadow-[0_0_15px_rgba(0,168,225,0.4)]">
                LOGIN
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
