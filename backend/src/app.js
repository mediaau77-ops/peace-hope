import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';

export function createApp() {
  const app = express();
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin not allowed by CORS'));
      },
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    res.json({ ok: true, data: { status: 'up' } });
  });

  app.get('/api/settings/public', (req, res) => {
    res.json({ ok: true, data: { churchName: 'Peace & Hope', theme: 'light' } });
  });

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, data: { status: 'up' } });
  });

  app.use((req, res) => {
    res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    res.status(error.status || 500).json({
      ok: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Something went wrong',
      },
    });
  });

  return app;
}
