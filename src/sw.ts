/* eslint-env serviceworker */
/// <reference lib="webworker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

declare const self: ServiceWorkerGlobalScope

// Define cache names
const CACHE_NAMES = {
  static: 'static-assets-v1',
  dynamic: 'dynamic-content-v1',
  pages: 'pages-v1',
  api: 'api-v1',
  offline: 'offline-v1'
}

// Clean up old caches
cleanupOutdatedCaches()

// Precache production assets only
// Development resources are excluded by Vite's build configuration
precacheAndRoute(self.__WB_MANIFEST)

// Create a background sync queue for failed requests
const bgSyncPlugin = new BackgroundSyncPlugin('failedRequests', {
  maxRetentionTime: 24 * 60 // Retry for up to 24 hours (specified in minutes)
})

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
    cacheName: CACHE_NAMES.pages,
    plugins: [
      // Ensure that only requests that result in a 200 status are cached
      new CacheableResponsePlugin({
        statuses: [200]
      })
    ],
    networkTimeoutSeconds: 3
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
           destination === 'image' ||
           destination === 'font'
  },
  new CacheFirst({
    cacheName: CACHE_NAMES.static,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200]
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true
      })
    ]
  })
)

// Cache API responses with a Network First strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: CACHE_NAMES.api,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 minutes
      }),
      bgSyncPlugin
    ]
  })
)

// Cache SearXNG API with Network First strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/searxng-api'),
  new NetworkFirst({
    cacheName: CACHE_NAMES.api,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 // 1 hour
      }),
      bgSyncPlugin
    ]
  })
)

// Cache SearXNG static assets
registerRoute(
  ({ url }) => url.pathname.startsWith('/searxng-api/static'),
  new CacheFirst({
    cacheName: CACHE_NAMES.static,
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
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => !Object.values(CACHE_NAMES).includes(cacheName))
            .map((cacheName) => caches.delete(cacheName))
        )
      }),
      // Tell the active service worker to take control of the page immediately
      self.clients.claim()
    ])
  )
})

// Handle errors
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Error:', event.error)
  // You could send this to your error tracking service
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Unhandled rejection:', event.reason)
  // You could send this to your error tracking service
}) 