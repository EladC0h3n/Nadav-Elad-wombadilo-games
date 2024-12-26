import express from 'express';
import { checkAuth, login, logout, signup } from '../controllers/auth.controller';
import { protectRoute } from '../middleware/auth.middleware';
const router = express.Router();


router.get("/check", protectRoute, checkAuth);

router.post("/login",login);
router.post("/logout", protectRoute, logout);
router.post("/signup",signup);

router.put("/update-profile", protectRoute, signup);


export default router;