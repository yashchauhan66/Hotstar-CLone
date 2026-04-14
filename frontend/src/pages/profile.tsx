import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { userAPI } from '../services/api';
import Layout from '../components/Layout';
import { User, Mail, Camera, Save, Loader, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { updateUser } from '../store/slices/authSlice';
import { AppDispatch } from '../store';

interface ProfileData {
  name: string;
  email: string;
  avatar: string;
  preferences: {
    category: string[];
    language: string;
  };
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    avatar: '',
    preferences: {
      category: [],
      language: 'en',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const categories = ['Movies', 'TV Shows', 'Sports', 'News', 'Kids'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'kn', name: 'Kannada' },
    { code: 'mr', name: 'Marathi' },
    { code: 'bn', name: 'Bengali' },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, router]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getProfile();
      if (response.data) {
        // Construct full avatar URL if it's a relative path
        const avatarUrl = response.data.avatar
          ? (response.data.avatar.startsWith('http')
              ? response.data.avatar
              : `http://localhost:5002${response.data.avatar}`)
          : '';

        setProfile({
          name: response.data.name || user?.name || '',
          email: response.data.email || user?.email || '',
          avatar: avatarUrl,
          preferences: {
            category: response.data.preferences?.category || [],
            language: response.data.preferences?.language || 'en',
          },
        });
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Profile doesn't exist yet, use auth user data
        setProfile({
          name: user?.name || '',
          email: user?.email || '',
          avatar: '',
          preferences: {
            category: [],
            language: 'en',
          },
        });
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      // Convert full URL to relative path for backend
      const avatarPath = profile.avatar.startsWith('http')
        ? profile.avatar.replace('http://localhost:5002', '')
        : profile.avatar;

      const response = await userAPI.updateProfile({
        name: profile.name,
        email: profile.email,
        avatar: avatarPath,
        preferences: profile.preferences,
      });

      setMessage('Profile updated successfully!');
      setProfile({
        ...profile,
        name: response.data.name,
        email: response.data.email,
        avatar: response.data.avatar.startsWith('http')
          ? response.data.avatar
          : `http://localhost:5002${response.data.avatar}`,
        preferences: response.data.preferences,
      });

      // Update Redux state to reflect changes across the app
      dispatch(updateUser({
        name: response.data.name,
        avatar: avatarUrl
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    const current = profile.preferences.category;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];

    setProfile({
      ...profile,
      preferences: { ...profile.preferences, category: updated },
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setError('');

    try {
      const response = await userAPI.uploadAvatar(file);
      const avatarUrl = `http://localhost:5002${response.data.data.avatar}`;
      setProfile({ ...profile, avatar: avatarUrl });
      
      // Update Redux state immediately after avatar upload
      dispatch(updateUser({
        avatar: avatarUrl
      }));

      setMessage('Avatar uploaded successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#0f1014] to-[#1a1c24] pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/">
              <button className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors">
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </button>
            </Link>
          </div>

          <div className="glass-effect rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-white/60 mb-8">Manage your personal information and preferences</p>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-[#00A8E1] animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00A8E1] to-[#6c5ce7] flex items-center justify-center border-4 border-white/10 overflow-hidden">
                      {isUploadingAvatar ? (
                        <Loader className="w-8 h-8 text-white animate-spin" />
                      ) : profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={48} className="text-white" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-[#00A8E1] rounded-full flex items-center justify-center hover:bg-[#0092c4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Upload photo"
                    >
                      {isUploadingAvatar ? (
                        <Loader size={18} className="text-white animate-spin" />
                      ) : (
                        <Camera size={18} className="text-white" />
                      )}
                    </button>
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-white/60 text-sm mt-3">Click camera icon to upload photo</p>
                </div>

                {/* Success/Error Messages */}
                {message && (
                  <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Name Field */}
                <div>
                  <label className="block text-white font-medium mb-2 flex items-center space-x-2">
                    <User size={18} className="text-[#00A8E1]" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-primary-300/50 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00A8E1] focus:bg-primary-400/50 transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-white font-medium mb-2 flex items-center space-x-2">
                    <Mail size={18} className="text-[#00A8E1]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full bg-primary-300/30 text-white/50 cursor-not-allowed rounded-lg py-3 px-4 focus:outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Avatar URL Field */}
                <div>
                  <label className="block text-white font-medium mb-2 flex items-center space-x-2">
                    <Camera size={18} className="text-[#00A8E1]" />
                    <span>Avatar URL</span>
                  </label>
                  <input
                    type="url"
                    value={profile.avatar}
                    onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                    className="w-full bg-primary-300/50 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00A8E1] focus:bg-primary-400/50 transition-all"
                    placeholder="Enter avatar image URL"
                  />
                </div>

                {/* Preferred Language */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    Preferred Language
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() =>
                          setProfile({
                            ...profile,
                            preferences: { ...profile.preferences, language: lang.code },
                          })
                        }
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          profile.preferences.language === lang.code
                            ? 'bg-[#00A8E1] text-white'
                            : 'bg-primary-300/50 text-white/70 hover:bg-primary-300'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Categories */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    Preferred Categories
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                          profile.preferences.category.includes(category)
                            ? 'bg-[#00A8E1] text-white'
                            : 'bg-primary-300/50 text-white/70 hover:bg-primary-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-[#00A8E1] hover:bg-[#0092c4] text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
