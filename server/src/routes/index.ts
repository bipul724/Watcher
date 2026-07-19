import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import incidentRoutes from './incident.routes.js';
import webhookRoutes from './webhook.routes.js';
import callbackRoutes from './callback.routes.js';
import discordRoutes from './discord.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/incidents', incidentRoutes);
router.use('/webhook', webhookRoutes);
router.use('/callback', callbackRoutes);
router.use('/discord', discordRoutes);

export default router;
