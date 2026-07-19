import { Router } from 'express';
import { getBotInfo } from '../controllers/discord.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Secure route with authentication
router.use(authenticateToken as any);
router.get('/bot-info', getBotInfo);

export default router;
