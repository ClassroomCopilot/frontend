/* eslint-env serviceworker */
/// <reference lib="webworker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

// Clean up old caches
cleanupOutdatedCaches()

// Precache production assets only
// Development resources are excluded by Vite's build configuration
precacheAndRoute(self.__WB_MANIFEST)

// Default page handler for offline usage,
// where the browser will fall back to the root index.html
const navigationHandler = createHandlerBoundToURL('/index.html')
const navigationRoute = new NavigationRoute(navigationHandler, {
  denylist: [
    /^\/(auth|rest|api|whisperlive|tldraw|searxng-api)/,
    /^\/@.*/,  // Block all /@vite/, /@react-refresh/, etc.
    /^\/src\/.*/  // Block all /src/ paths
  ]
})
registerRoute(navigationRoute)

// Cache page navigations (html) with a Network First strategy
registerRoute(
  // Check to see if the request is a navigation to a new page
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    // Put all cached files in a cache named 'pages'
    cacheName: 'pages',
    plugins: [
      // Ensure that only requests that result in a 200 status are cached
      new CacheableResponsePlugin({
        statuses: [200]
      })
    ]
  })
)

// Cache manifest and icons with a Stale While Revalidate strategy
registerRoute(
  ({ request }) => 
    request.destination === 'manifest' || 
    request.url.includes('/icons/'),
  new StaleWhileRevalidate({
    cacheName: 'manifest-and-icons',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200]
      })
    ]
  })
)

// Cache other static assets with a Cache First strategy
registerRoute(
  ({ request }) => {
    const destination = request.destination;
    return destination === 'style' || 
           destination === 'script' || 
           destination === 'image';
  },
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
)

// Add specific handling for SearXNG API
registerRoute(
  ({ url }) => url.pathname.startsWith('/searxng-api'),
  new NetworkFirst({
    cacheName: 'searxng-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 // 1 hour
      })
    ]
  })
)

// Add specific handling for SearXNG static assets
registerRoute(
  ({ url }) => url.pathname.startsWith('/searxng-api/static'),
  new CacheFirst({
    cacheName: 'searxng-api-static',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
)

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Handle offline fallback
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Enable navigation preload if available
      self.registration.navigationPreload?.enable(),
      // Tell the active service worker to take control of the page immediately
      self.clients.claim()
    ])
  )
}) 