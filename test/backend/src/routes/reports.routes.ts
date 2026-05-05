import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as controller from '../controllers/reports.controller';

const router = Router();

router.use(authMiddleware);

router.get('/summary', controller.summary as unknown as RequestHandler);
router.get('/monthly', controller.monthly as unknown as RequestHandler);

export default router;