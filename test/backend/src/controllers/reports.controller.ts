import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { createAuthenticatedClient } from '../config/supabase';
import * as service from '../services/reports.service';

export async function summary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const accountId = req.query.accountId as string | undefined;
    const data = await service.getSummary(client, req.userId, year, accountId);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function monthly(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const accountId = req.query.accountId as string | undefined;
    const data = await service.getMonthly(client, req.userId, year, accountId);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}