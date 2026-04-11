

import express from 'express';
import { uploadVideo, uploadVideoWithThumbnail, getAllVideos, getVideoById, getTrendingVideos, getLatestVideos, getRecommendedVideos } from '../controllers/videoController.js';
import { uploadSingle, uploadWithThumbnail, handleUploadError } from '../middlewares/uploadMiddleware.js';
import { role } from '../middlewares/roleMiddleware.js';
import  auth  from '../middlewares/authMiddleware.js';
import { DeleteVideo }  from "../controllers/videoController.js";

const router = express.Router();

router.post('/upload', auth, role("admin"), uploadWithThumbnail, handleUploadError, uploadVideoWithThumbnail);

router.post('/upload/video', auth, role("admin"), uploadSingle, handleUploadError, uploadVideo);

router.get('/videos', getAllVideos);

router.delete('/videos/delete/:id', auth, role("admin"), DeleteVideo);


router.get('/videos/trending', getTrendingVideos);
router.get('/videos/latest', getLatestVideos);
router.get('/videos/recommended', getRecommendedVideos);
router.get('/videos/:id', getVideoById);

export default router;
