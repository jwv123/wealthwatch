import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

function formatAuthResponse(data: any) {
  const session = data.session;
  if (!data.user) {
    return { confirmationRequired: true, user: null };
  }
  if (!session) {
    return { confirmationRequired: true, user: { id: data.user.id, email: data.user.email } };
  }
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user: { id: data.user.id, email: data.user.email },
  };
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json(formatAuthResponse(data));
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, display_name } = req.body;
    const data = await authService.register(email, password, display_name);
    const response = formatAuthResponse(data);
    res.status(201).json(response);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const token = req.headers.authorization?.split(' ')[1]!;
    await authService.logout(token);
    res.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refresh_token } = req.body;
    const data = await authService.refreshToken(refresh_token);
    res.json(data);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const profile = await authService.getProfile((req as any).userId);
    res.json(profile);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const profile = await authService.updateProfile((req as any).userId, req.body);
    res.json(profile);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}