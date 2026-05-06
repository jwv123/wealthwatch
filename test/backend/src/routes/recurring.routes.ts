import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import * as controller from '../controllers/recurring.controller';

const router = Router();

const frequencyEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

// ─── Recurring Transactions ────────────────────────────────────────

const createRecurringTransactionSchema = z.object({
  account_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  description: z.string().min(1).max(255),
  frequency: frequencyEnum,
  interval_value: z.number().int().min(1).default(1),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  is_active: z.boolean().default(true),
});

const updateRecurringTransactionSchema = z.object({
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable().optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  description: z.string().min(1).max(255).optional(),
  frequency: frequencyEnum.optional(),
  interval_value: z.number().int().min(1).optional(),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  is_active: z.boolean().optional(),
  next_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// ─── Recurring Transfers ──────────────────────────────────────────

const createRecurringTransferSchema = z.object({
  from_account_id: z.string().uuid(),
  to_account_id: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(255).default(''),
  frequency: frequencyEnum,
  interval_value: z.number().int().min(1).default(1),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  is_active: z.boolean().default(true),
});

const updateRecurringTransferSchema = z.object({
  from_account_id: z.string().uuid().optional(),
  to_account_id: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  description: z.string().max(255).optional(),
  frequency: frequencyEnum.optional(),
  interval_value: z.number().int().min(1).optional(),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  is_active: z.boolean().optional(),
  next_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// ─── Routes ───────────────────────────────────────────────────────

router.use(authMiddleware);

router.get('/transactions', controller.listRecurringTransactions as unknown as RequestHandler);
router.post('/transactions', validate(createRecurringTransactionSchema), controller.createRecurringTransaction as unknown as RequestHandler);
router.patch('/transactions/:id', validate(updateRecurringTransactionSchema), controller.updateRecurringTransaction as unknown as RequestHandler);
router.delete('/transactions/:id', controller.deleteRecurringTransaction as unknown as RequestHandler);

router.get('/transfers', controller.listRecurringTransfers as unknown as RequestHandler);
router.post('/transfers', validate(createRecurringTransferSchema), controller.createRecurringTransfer as unknown as RequestHandler);
router.patch('/transfers/:id', validate(updateRecurringTransferSchema), controller.updateRecurringTransfer as unknown as RequestHandler);
router.delete('/transfers/:id', controller.deleteRecurringTransfer as unknown as RequestHandler);

router.post('/process', controller.processDue as unknown as RequestHandler);

export default router;