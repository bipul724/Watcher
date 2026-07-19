import { Router } from 'express';
import { handleWebhook } from '../controllers/webhook.controller.js';

const router = Router();

// Accept both /wh/:secret and /webhook/:secret to be extremely flexible
router.post('/wh/:secret', handleWebhook);
router.post('/:secret', handleWebhook);

export default router;
