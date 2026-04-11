

import express from 'express';
import {
  streamVideoFile,
  getVideoDetails,
  getAllVideos,
  getPlayerPage
} from '../controllers/streamController.js';

const router = express.Router();

router.get('/stream/:filename', streamVideoFile);


router.get('/info/:filename', getVideoDetails);


router.get('/videos', getAllVideos);


router.get('/player/:filename', getPlayerPage);

export default router;
