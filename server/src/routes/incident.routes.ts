import { Router } from 'express';
import { list, get, getRuns } from '../controllers/incident.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);

router.get('/', list);
router.get('/:id', get);
router.get('/:id/runs', getRuns);

export default router;
