import express from "express";
import {Signup , Login, Logout, GetProfile} from "../controllers/authController.js"
import { roleMiddleware } from "../middleware/roleMiddleware.js";
const router= express.Router();
router.post("/signup", Signup);
router.post("/login" , Login);
router.post("/logout" , Logout);
router.get("/profile" , GetProfile);
export default router;
