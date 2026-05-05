import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import * as controller from '../controllers/categories.controller';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['income', 'expense']),
  icon: z.string().max(30).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  type: z.enum(['income', 'expense']).optional(),
  icon: z.string().max(30).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

router.use(authMiddleware);

router.get('/', controller.list as unknown as RequestHandler);
router.post('/', validate(createSchema), controller.create as unknown as RequestHandler);
router.post('/reset-defaults', controller.resetToDefaults as unknown as RequestHandler);
router.patch('/:id', validate(updateSchema), controller.update as unknown as RequestHandler);
router.delete('/:id', controller.remove as unknown as RequestHandler);

export default router;