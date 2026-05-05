import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../test/backend/dist/app';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel strips /api from req.url for catch-all routes — restore it
  if (!req.url?.startsWith('/api')) {
    req.url = `/api${req.url || ''}`;
  }
  return app(req, res);
}