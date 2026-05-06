import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import * as controller from '../controllers/accounts.controller';

const router = Router();

const accountTypes = ['checking', 'savings', 'credit_card', 'cash', 'investment', 'loan'] as const;

const createSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(accountTypes),
  initial_balance: z.coerce.number().min(0).default(0),
  currency: z.string().length(3).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(30).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  type: z.enum(accountTypes).optional(),
  initial_balance: z.coerce.number().min(0).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(30).optional(),
  is_default: z.boolean().optional(),
});

router.use(authMiddleware);

router.get('/', controller.list as unknown as RequestHandler);
router.post('/', validate(createSchema), controller.create as unknown as RequestHandler);
router.patch('/:id', validate(updateSchema), controller.update as unknown as RequestHandler);
router.delete('/:id', controller.remove as unknown as RequestHandler);

export default router;