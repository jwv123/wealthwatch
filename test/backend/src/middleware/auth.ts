import { Request, Response, NextFunction } from 'express';
import { supabaseClient } from '../config/supabase';

export interface AuthRequest extends Request {
  userId: string;
  userEmail: string;
  accessToken: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const { data, error } = await supabaseClient.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  (req as AuthRequest).userId = data.user.id;
  (req as AuthRequest).userEmail = data.user.email ?? '';
  (req as AuthRequest).accessToken = token;
  next();
}