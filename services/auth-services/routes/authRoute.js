import express from "express";
import {Signup , Login} from "../controllers/authController.js"
import { roleMiddleware } from "../middleware/roleMiddleware.js";
const router= express.Router();
router.post("/signup", Signup);
router.post("/login" , Login);
export default router;