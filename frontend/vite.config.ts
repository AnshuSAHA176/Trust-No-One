import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'excluding-friendship-innovations-occurred.trycloudflare.com',
      '.trycloudflare.com',
    ],
    proxy: {
      '/register': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/game': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/conversation': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
