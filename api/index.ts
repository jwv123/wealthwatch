import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../test/backend/src/app';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const originalPath = req.query.__path as string;
  if (originalPath) {
    // Rebuild query string from all params except __path
    const params = Object.entries(req.query)
      .filter(([key]) => key !== '__path')
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val as string)}`)
      .join('&');
    req.url = params ? `${originalPath}?${params}` : originalPath;
  }
  return app(req, res);
}