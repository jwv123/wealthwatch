import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import * as controller from '../controllers/transfers.controller';

const router = Router();

const createSchema = z.object({
  from_account_id: z.string().uuid(),
  to_account_id: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(255).default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const updateSchema = z.object({
  from_account_id: z.string().uuid().optional(),
  to_account_id: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  description: z.string().max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

router.use(authMiddleware);

router.get('/', controller.list as unknown as RequestHandler);
router.post('/', validate(createSchema), controller.create as unknown as RequestHandler);
router.patch('/:id', validate(updateSchema), controller.update as unknown as RequestHandler);
router.delete('/:id', controller.remove as unknown as RequestHandler);

export default router;