import { protectRoute } from '../middleware/auth.middleware.js';
import { checkAuth, login, logout, signup, updateProfile } from '../controllers/auth.controller.js';
import express from 'express';
const router = express.Router();


router.get("/check", protectRoute, checkAuth);

router.post("/login",login);
router.post("/logout", protectRoute, logout);
router.post("/signup",signup);

router.put("/update-profile", protectRoute, updateProfile);


export default router;