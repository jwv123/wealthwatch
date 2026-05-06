import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { createAuthenticatedClient } from '../config/supabase';
import * as service from '../services/recurring.service';

// ─── Recurring Transactions ────────────────────────────────────────

export async function listRecurringTransactions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const filters = {
      isActive: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
    };
    const data = await service.getUserRecurringTransactions(client, req.userId, filters);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function createRecurringTransaction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.createRecurringTransaction(client, req.userId, req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function updateRecurringTransaction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.updateRecurringTransaction(client, req.userId, req.params.id, req.body);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function deleteRecurringTransaction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    await service.deleteRecurringTransaction(client, req.userId, req.params.id);
    res.json({ message: 'Recurring transaction deleted' });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

// ─── Recurring Transfers ──────────────────────────────────────────

export async function listRecurringTransfers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const filters = {
      isActive: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
    };
    const data = await service.getUserRecurringTransfers(client, req.userId, filters);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function createRecurringTransfer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.createRecurringTransfer(client, req.userId, req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function updateRecurringTransfer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.updateRecurringTransfer(client, req.userId, req.params.id, req.body);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function deleteRecurringTransfer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    await service.deleteRecurringTransfer(client, req.userId, req.params.id);
    res.json({ message: 'Recurring transfer deleted' });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

// ─── Process Due Items ────────────────────────────────────────────

export async function processDue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const result = await service.processDueItems(client, req.userId);
    res.json(result);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}