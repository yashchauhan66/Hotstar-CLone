import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Upload as UploadIcon, Film, FileText, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

const UploadPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'movie',
    video: null as File | null,
    thumbnail: null as File | null,
    youtubeUrl: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [thumbnailSource, setThumbnailSource] = useState<'file' | 'youtube' | 'auto'>('auto');

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Handle video file selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Allowed types: MP4, MOV, AVI, MKV');
        return;
      }
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File too large. Maximum size is 100MB');
        return;
      }
      setFormData({ ...formData, video: file });
      setError('');
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid thumbnail type. Allowed: JPG, PNG, WebP');
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Thumbnail too large. Maximum size is 5MB');
        return;
      }
      setFormData({ ...formData, thumbnail: file, youtubeUrl: '' });
      setThumbnailSource('file');
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      setError('');
    }
  };

  // Handle YouTube URL input
  const handleYoutubeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, youtubeUrl: url, thumbnail: null });
    setThumbnailSource(url ? 'youtube' : 'auto');
    
    // Extract and preview YouTube thumbnail
    if (url) {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        setThumbnailPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      } else {
        setThumbnailPreview('');
      }
    } else {
      setThumbnailPreview('');
    }
  };

  // Extract YouTube video ID
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /youtu\.be\/([^#&?]{11})/,
      /youtube\.com\/watch\?v=([^#&?]{11})/,
      /youtube\.com\/embed\/([^#&?]{11})/,
      /[?&]v=([^#&?]{11})/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.video || !formData.title) {
      setError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('video', formData.video);
      
      // DEBUG: Log form data
      console.log('Video file:', formData.video?.name, formData.video?.type);
      
      // Add thumbnail if provided
      if (formData.thumbnail) {
        uploadFormData.append('thumbnail', formData.thumbnail);
        console.log('Thumbnail file:', formData.thumbnail.name, formData.thumbnail.type, formData.thumbnail.size);
      }
      
      // Add YouTube URL if provided
      if (formData.youtubeUrl) {
        uploadFormData.append('youtubeUrl', formData.youtubeUrl);
        console.log('YouTube URL:', formData.youtubeUrl);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5003/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      setUploadResult(result.data);
      // Show success for 2 seconds then redirect
      setTimeout(() => router.push('/'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#00A8E1] rounded-lg flex items-center justify-center mx-auto mb-4">
            <UploadIcon size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Upload Video</h1>
          <p className="text-gray-400">Share your content with the world</p>
        </div>

        {/* Upload Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Video Upload */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center">
                <Film className="w-5 h-5 mr-2 text-[#00A8E1]" />
                Video File *
              </label>
              <p className="text-gray-400 text-sm mb-2">Accepted formats: MP4, MOV, AVI, MKV (Max 100MB)</p>
              <div className="relative">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                  onChange={handleVideoChange}
                  required
                  className="w-full bg-gray-700/50 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#00A8E1] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#00A8E1] file:text-white file:cursor-pointer hover:file:bg-[#0092c4]"
                />
                {formData.video && (
                  <p className="mt-2 text-sm text-green-400 flex items-center">
                    ✓ {formData.video.name} ({(formData.video.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#00A8E1]" />
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full bg-gray-700/50 text-white placeholder-gray-500 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00A8E1] transition-all"
                placeholder="Enter video title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#00A8E1]" />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-gray-700/50 text-white placeholder-gray-500 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00A8E1] transition-all resize-none"
                placeholder="Enter video description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center">
                <Film className="w-5 h-5 mr-2 text-[#00A8E1]" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-700/50 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00A8E1] transition-all appearance-none cursor-pointer"
              >
                <option value="movie" className="bg-gray-800">Movie</option>
                <option value="tv" className="bg-gray-800">TV Show</option>
                <option value="sports" className="bg-gray-800">Sports</option>
                <option value="news" className="bg-gray-800">News</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Thumbnail Options */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-[#00A8E1]" />
                Thumbnail (Optional)
              </h3>
              
              {/* Option 1: Upload Thumbnail File */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <label className="block text-gray-300 text-sm mb-2 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-[#00A8E1] text-white text-xs flex items-center justify-center mr-2">1</span>
                  Upload Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleThumbnailChange}
                  className="w-full bg-gray-700/50 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00A8E1] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-600 file:text-white file:cursor-pointer hover:file:bg-gray-500 text-sm"
                />
                <p className="text-gray-500 text-xs mt-1">JPG, PNG, WebP (Max 5MB)</p>
              </div>

              {/* Option 2: YouTube URL */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <label className="block text-gray-300 text-sm mb-2 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-[#00A8E1] text-white text-xs flex items-center justify-center mr-2">2</span>
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Or Use YouTube URL
                </label>
                <input
                  type="text"
                  value={formData.youtubeUrl}
                  onChange={handleYoutubeChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-gray-700/50 text-white placeholder-gray-500 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00A8E1] transition-all"
                />
                <p className="text-gray-500 text-xs mt-1">Thumbnail will be extracted from video</p>
              </div>

              {/* Option 3: Auto (Default) */}
              {!formData.thumbnail && !formData.youtubeUrl && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-400 text-sm flex items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-2">3</span>
                    <span className="font-semibold">Auto:</span> Poster will be fetched from TMDb or generated from title
                  </p>
                </div>
              )}

              {/* Thumbnail Preview */}
              {thumbnailPreview && (
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-2">Preview:</p>
                  <div className="relative w-32 h-48 rounded-lg overflow-hidden">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/3B82F6/white?text=No+Preview';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        thumbnailSource === 'file' ? 'bg-green-500 text-white' :
                        thumbnailSource === 'youtube' ? 'bg-red-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {thumbnailSource === 'file' ? 'File' :
                         thumbnailSource === 'youtube' ? 'YouTube' : 'Auto'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Success Message with Poster */}
            {uploadResult && (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                <p className="text-green-400 font-semibold mb-2">✅ Upload Successful!</p>
                {uploadResult.thumbnail && (
                  <div className="mt-2">
                    <p className="text-gray-400 text-xs mb-1">Thumbnail:</p>
                    <img 
                      src={uploadResult.thumbnail} 
                      alt="Movie Poster" 
                      className="w-32 h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-[#00A8E1] hover:bg-[#0092c4] disabled:bg-gray-600 text-white font-bold py-4 rounded-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,168,225,0.4)]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-5 h-5" />
                  <span>Upload Video</span>
                </>
              )}
            </button>
          </form>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
