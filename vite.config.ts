import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const isHttpsProxy =
    Boolean(process.env.APP_URL?.startsWith('https')) ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.CODESPACES) ||
    Boolean(process.env.K_SERVICE);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr:
        process.env.DISABLE_HMR === 'true'
          ? false
          : isHttpsProxy
          ? {
              clientPort: 443,
              protocol: 'wss',
            }
          : {
              host: '0.0.0.0',
              protocol: 'ws',
            },
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
