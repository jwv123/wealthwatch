import app from '../test/backend/dist/app';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel catch-all may strip /api prefix — restore it for Express routing
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  return app(req, res);
}