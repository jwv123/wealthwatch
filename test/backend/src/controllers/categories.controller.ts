import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { createAuthenticatedClient } from '../config/supabase';
import * as service from '../services/categories.service';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const type = req.query.type as 'income' | 'expense' | undefined;
    const data = await service.getUserCategories(client, req.userId, type);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.createCategory(client, req.userId, req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.updateCategory(client, req.userId, req.params.id, req.body);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    await service.deleteCategory(client, req.userId, req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function resetToDefaults(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = createAuthenticatedClient(req.accessToken);
    const data = await service.resetToDefaults(client, req.userId);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}