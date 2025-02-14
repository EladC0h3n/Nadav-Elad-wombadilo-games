import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getMessages, getUnreadCounts, getUsers, sendMessage } from '../controllers/messages.controller.js';

const router = express.Router();


router.get("/users", protectRoute, getUsers);
router.get("/unread/counts", protectRoute, getUnreadCounts);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;