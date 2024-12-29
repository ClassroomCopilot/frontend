/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env': env
    },
    envPrefix: ['VITE_', 'HOST_', 'PORT_'],
    server: {
      host: true,
      port: parseInt(env.VITE_PORT_FRONTEND),
      watch: {
        usePolling: true,
        interval: 1000
      }
    },
    clearScreen: false,
    optimizeDeps: {
      force: true
    }
  };
});
