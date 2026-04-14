

import express from 'express';
import { getTrendingVideos, getLatestVideos, getRecommendedVideos, getVideoById, getAllVideos, DeleteVideo, uploadVideo, uploadVideoWithThumbnail, searchVideos } from '../controllers/videoController.js';
import { addComment, getVideoComments, deleteComment } from '../controllers/commentController.js';
import { uploadSingle, uploadWithThumbnail, handleUploadError } from '../middlewares/uploadMiddleware.js';
import { role } from '../middlewares/roleMiddleware.js';
import { auth } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.post('/upload', auth, role("admin"), uploadWithThumbnail, handleUploadError, uploadVideoWithThumbnail);
router.post('/upload/video', auth, role("admin"), uploadSingle, handleUploadError, uploadVideo);

router.get('/videos', getAllVideos);
router.delete('/videos/delete/:id', auth, role("admin"), DeleteVideo);

router.get('/videos/search', searchVideos);
router.get('/videos/trending', getTrendingVideos);
router.get('/videos/latest', getLatestVideos);
router.get('/videos/recommended', getRecommendedVideos);
router.get('/videos/:id', getVideoById);

// Comment routes
router.post('/videos/comments', auth, addComment);
router.get('/videos/:videoId/comments', getVideoComments);
router.delete('/videos/comments/:commentId', auth, deleteComment);

export default router;
