import { Router } from 'express';
import { handleApproval } from '../controllers/callback.controller.js';

const router = Router();

router.post('/approve', handleApproval);

export default router;
