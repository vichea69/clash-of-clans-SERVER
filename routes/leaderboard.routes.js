import express from 'express';
import leaderboardController from '../controllers/leaderboard.controller.js';

const router = express.Router();

// Route to get global legend league leaderboard
router.get('/legend/global', leaderboardController.getGlobalLegendLeaderboard);

// Route to get paginated leaderboard
router.get('/legend/global/paginated', leaderboardController.getPaginatedLeaderboard);

export default router; 