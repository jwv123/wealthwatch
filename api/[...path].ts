import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../test/backend/src/app';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  return app(req, res);
}