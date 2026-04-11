import express from "express";
import {protect} from "../middleware/authMiddleware.js"
import {createProfile , getProfile , updateProfile, addToHistory, uploadAvatar} from "../controllers/userController.js"
import {uploadAvatar as uploadAvatarMiddleware, handleUploadError} from "../middleware/uploadMiddleware.js"
const router= express.Router();
router.post("/profile" ,protect, createProfile);
router.get("/profile" ,protect, getProfile);
router.put("/profile" ,protect, updateProfile);
router.post("/history" ,protect, addToHistory);
// Upload avatar photo
router.post("/avatar", protect, uploadAvatarMiddleware, handleUploadError, uploadAvatar);
export default router;