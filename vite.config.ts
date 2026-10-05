import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
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
      proxy: {
        '/api/mas-sora': {
          target: 'https://eservices.mas.gov.sg',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api\/mas-sora/, '/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily'),
          headers: {
            KeyId: '77e13560-d485-446e-a1df-ae88dd7a02e7',
            Accept: 'application/json',
          },
        },
        '/api/mas-exchange': {
          target: 'https://eservices.mas.gov.sg',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api\/mas-exchange/, '/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily'),
          headers: {
            KeyId: '77e13560-d485-446e-a1df-ae88dd7a02e7',
            Accept: 'application/json',
          },
        },
      },
    },
  };
});
