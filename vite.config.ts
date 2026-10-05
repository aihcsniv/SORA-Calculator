import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Plugin to serve /api/health and /api/sora directly from the root /api folder
function apiEndpointsPlugin(): Plugin {
  return {
    name: 'api-endpoints',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        if (url === '/api/health' || url.startsWith('/api/health?')) {
          try {
            const { default: healthHandler } = await import('./api/health.ts');
            return healthHandler(req, res);
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err?.message || 'Health check error' }));
          }
        }

        if (url === '/api/sora' || url.startsWith('/api/sora?')) {
          try {
            const { default: soraHandler } = await import('./api/sora.js');
            return soraHandler(req, res);
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err?.message || 'SORA API error' }));
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiEndpointsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
