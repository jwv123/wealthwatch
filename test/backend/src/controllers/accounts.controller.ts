import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { createAuthenticatedClient } from '../config/supabase';
import * as service from '../services/accounts.service';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.getUserAccounts(client, req.userId);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.createAccount(client, req.userId, req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.updateAccount(client, req.userId, req.params.id, req.body);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    await service.deleteAccount(client, req.userId, req.params.id);
    res.json({ message: 'Account deleted' });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}