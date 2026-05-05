import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import * as controller from '../controllers/transactions.controller';

const router = Router();

const createSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  description: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  metadata: z.record(z.unknown()).optional(),
});

const updateSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  description: z.string().min(1).max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  metadata: z.record(z.unknown()).optional(),
});

router.use(authMiddleware);

router.get('/', controller.list as unknown as RequestHandler);
router.post('/', validate(createSchema), controller.create as unknown as RequestHandler);
router.post('/delete-all', controller.deleteAll as unknown as RequestHandler);
router.patch('/:id', validate(updateSchema), controller.update as unknown as RequestHandler);
router.delete('/:id', controller.remove as unknown as RequestHandler);

export default router;