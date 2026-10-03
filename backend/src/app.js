import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createClient } from '@supabase/supabase-js';
import { env } from './config/env.js';

export function createApp() {
  const app = express();
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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

  app.get('/api/settings/public', async (_req, res, next) => {
    try {
      const { data: publicSettings, error: publicSettingsError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'public')
        .maybeSingle();

      if (publicSettingsError) throw publicSettingsError;
      if (publicSettings?.value) {
        res.json({ ok: true, data: publicSettings.value });
        return;
      }

      const { data: settingsRow, error: settingsRowError } = await supabase
        .from('settings')
        .select('church_name, tagline, mission_statement, contact_email, contact_phone, address, country, default_language, supported_languages, theme, social_links')
        .limit(1)
        .maybeSingle();

      if (settingsRowError) throw settingsRowError;
      res.json({ ok: true, data: settingsRow || null });
    } catch (error) {
      next(error);
    }
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
