import { Router } from 'express';
import { signup, login, me, SignupSchema, LoginSchema } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

router.post('/signup', validateRequest(SignupSchema), signup);
router.post('/login', validateRequest(LoginSchema), login);
router.get('/me', authenticateToken as any, me);

export default router;
