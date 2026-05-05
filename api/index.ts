import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../test/backend/src/app';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Rewrite passes original path via __path query param
  const originalPath = req.query.__path as string;
  if (originalPath) {
    req.url = originalPath;
  }
  return app(req, res);
}