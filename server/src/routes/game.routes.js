import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { startGame } from '../controllers/game.controller.js';
const router = express.Router();

router.get("/startGame/:id", protectRoute, startGame);


export default router;