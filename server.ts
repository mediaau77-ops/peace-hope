import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api.routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());
  app.use(cookieParser());

  // Mount backend API routes strictly at /api
  app.use('/api', apiRouter);

  // Backend OAuth callback handler: exchanges code, sets httpOnly cookie, ensures profile row exists, and redirects
  app.get('/auth/callback', async (req, res) => {
    try {
      const code = req.query.code as string;
      const returnUrl = (req.query.returnUrl as string) || '/';
      if (code) {
        const { getDbClient, SUPABASE_TABLES } = await import('./server/db/client');
        const supabase = getDbClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
          res.cookie('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          // Ensure profiles row exists
          const u = data.session.user;
          const fullName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Member';
          const avatarUrl = u.user_metadata?.avatar_url || u.user_metadata?.picture;

          try {
            await supabase.from(SUPABASE_TABLES.PROFILES).upsert({
              id: u.id,
              email: u.email,
              full_name: fullName,
              avatar_url: avatarUrl,
              role: 'member',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
          } catch {
            // Non-blocking profile upsert
          }
        }
      }
      res.redirect(returnUrl);
    } catch (err) {
      console.error('[AUTH CALLBACK ERROR]:', err);
      res.redirect('/');
    }
  });

  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Peace & Hope 3-Tier Backend listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER CRITICAL ERROR]:', err);
  process.exit(1);
});
