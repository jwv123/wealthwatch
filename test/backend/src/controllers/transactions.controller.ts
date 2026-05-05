import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { createAuthenticatedClient } from '../config/supabase';
import * as service from '../services/transactions.service';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const filters = {
      type: req.query.type as 'income' | 'expense' | undefined,
      dateFrom: req.query.from as string | undefined,
      dateTo: req.query.to as string | undefined,
      categoryId: req.query.categoryId as string | undefined,
    };
    const data = await service.getUserTransactions(client, req.userId, filters);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.createTransaction(client, req.userId, req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.updateTransaction(client, req.userId, req.params.id, req.body);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    await service.deleteTransaction(client, req.userId, req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function deleteAll(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    await service.deleteAllTransactions(client, req.userId);
    res.json({ message: 'All transactions deleted' });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}