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

  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'prompt',
        injectRegister: 'auto',
        devOptions: {
          enabled: false,
          type: 'module'
        },
        manifest: {
          name: 'Classroom Copilot',
          short_name: 'ClassroomCopilot',
          start_url: '/',
          display: 'fullscreen',
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
          ]
        },
        injectManifest: {
          globPatterns: isProd ? [
            'index.html',
            'assets/**/*.{js,css,html,ico,png,svg,json}',
            'icons/**/*.{png,svg}',
            'manifest.webmanifest'
          ] : [],
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB
          dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
          // Exclude development resources and source files
          globIgnores: [
            '**/node_modules/**/*',
            'sw.js',
            'workbox-*.js',
            '**/*.map',
            '**/vite/**/*',
            '**/@vite/**/*',
            '**/@react-refresh/**/*',
            '**/src/**/*'
          ]
        }
      })
    ],
    define: {
      'process.env': env
    },
    envPrefix: ['VITE_', 'HOST_', 'PORT_'],
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT_FRONTEND),
      watch: {
        usePolling: true,
        interval: 1000
      }
    },
    clearScreen: false,
    optimizeDeps: {
      force: true
    },
    build: {
      sourcemap: !isProd,
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom']
          }
        }
      },
      chunkSizeWarningLimit: 2000
    }
  };
});
