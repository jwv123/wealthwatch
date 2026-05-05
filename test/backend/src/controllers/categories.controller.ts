import { Response } from 'express';
import { AuthRequest } from '../types/express';
import * as service from '../services/categories.service';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const type = req.query.type as 'income' | 'expense' | undefined;
    const data = await service.getUserCategories(req.userId, type);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await service.createCategory(req.userId, req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await service.updateCategory(req.userId, req.params.id, req.body);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    await service.deleteCategory(req.userId, req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function resetToDefaults(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await service.resetToDefaults(req.userId);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}