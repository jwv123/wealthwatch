import { Router, Request, Response } from 'express';
import { env } from '../config/env';
import { supabaseAdmin } from '../config/supabase';
import { processAllDueItems } from '../services/recurring.service';

const router = Router();

router.post('/process-recurring', async (req: Request, res: Response): Promise<void> => {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${env.RECURRING_CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const result = await processAllDueItems(supabaseAdmin);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;