import { Response } from 'express';
import { AuthRequest } from '../types/express';
import * as service from '../services/reports.service';

export async function summary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const data = await service.getSummary(req.userId, year);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function monthly(req: AuthRequest, res: Response): Promise<void> {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const data = await service.getMonthly(req.userId, year);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}