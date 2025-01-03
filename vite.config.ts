/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Classroom Copilot',
          short_name: 'ClassCopilot',
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#000000',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
          share_target: {
            action: '/share',
            method: 'POST',
            enctype: 'multipart/form-data',
            params: {
              title: 'name',
              text: 'description',
              url: 'url',
              files: [
                {
                  name: 'file',
                  accept: ['image/*', 'text/*', 'application/pdf']
                }
              ]
            }
          }
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
        }
      })
    ],
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
