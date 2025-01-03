/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(async ({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Dynamic import of PWA plugin
  const { VitePWA } = await import('vite-plugin-pwa');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
        },
        includeAssets: ['icons/*'],
        manifest: {
          name: 'Classroom Copilot',
          short_name: 'ClassCopilot',
          start_url: '/',
          display: 'minimal-ui',
          background_color: '#ffffff',
          theme_color: '#000000',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-192x192-maskable.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icons/icon-512x512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
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
