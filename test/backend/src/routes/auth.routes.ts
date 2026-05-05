import { Router } from 'express';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import * as controller from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  display_name: z.string().min(1).max(50).optional(),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

const updateProfileSchema = z.object({
  default_currency: z.string().length(3).optional(),
  display_name: z.string().min(1).max(50).optional(),
});

router.post('/login', validate(loginSchema), controller.login);
router.post('/register', validate(registerSchema), controller.register);
router.post('/logout', authMiddleware, controller.logout);
router.post('/refresh', validate(refreshSchema), controller.refresh);
router.get('/profile', authMiddleware, controller.getProfile);
router.patch('/profile', authMiddleware, validate(updateProfileSchema), controller.updateProfile);

export default router;