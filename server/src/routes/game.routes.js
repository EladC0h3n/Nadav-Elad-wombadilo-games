import express from 'express';
const router = express.Router();

import { protectRoute } from '../middleware/auth.middleware.js';
import { makeMove, getGame, getGames, offerDraw, respondToDrawOffer, resign, sendGameInvite, acceptGameInvite, declineGameInvite, getGameInvites } from '../controllers/game.controller.js';

router.post('/move/:gameId', protectRoute, makeMove);
router.get('/games', protectRoute, getGames);
router.get('/:gameId', protectRoute, getGame);
router.post('/:gameId/draw/offer', protectRoute, offerDraw);
router.post('/:gameId/draw/respond', protectRoute, respondToDrawOffer);
router.post('/:gameId/resign', protectRoute, resign);
router.post('/invite', protectRoute, sendGameInvite);
router.post('/invite/:gameId/accept', protectRoute, acceptGameInvite);
router.post('/invite/:gameId/decline', protectRoute, declineGameInvite);
router.get('/invites', protectRoute, getGameInvites);

export default router;
