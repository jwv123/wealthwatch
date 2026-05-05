import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { rateLimiter } from './middleware/rate-limiter';
import { errorHandler } from './middleware/error-handler';
import authRoutes from './routes/auth.routes';
import categoriesRoutes from './routes/categories.routes';
import transactionsRoutes from './routes/transactions.routes';
import reportsRoutes from './routes/reports.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(rateLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/reports', reportsRoutes);

app.use(errorHandler);

export default app;