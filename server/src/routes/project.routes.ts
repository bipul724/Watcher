import { Router } from 'express';
import { create, get, list, update, remove, validateLLM, CreateProjectSchema, UpdateProjectSchema } from '../controllers/project.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

router.use(authenticateToken as any);

router.post('/', validateRequest(CreateProjectSchema), create);
router.post('/validate-llm', validateLLM);
router.get('/', list);
router.get('/:id', get);
router.patch('/:id', validateRequest(UpdateProjectSchema), update);
router.delete('/:id', remove);


export default router;
