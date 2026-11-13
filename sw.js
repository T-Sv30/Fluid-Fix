// Offline support for the browser version. The Android app ships its files inside the app
// and never registers this.
//
// Strategy: answer from the cache straight away and refresh the cache in the background, so
// the app opens instantly, works offline, and picks up a new version on the following visit.

'use strict';

const CACHE = 'rippl-studio-v1';
const SHELL = [
    './',
    'index.html',
    'ui.css',
    'native.js',
    'ui.js',
    'script.js',
    'LDR_LLL1_0.png',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(caches.open(CACHE).then(async cache => {
        // "?v=1.0.0" style stamps only exist to refresh old browser caches
        const cached = await cache.match(request, { ignoreSearch: true });
        const fresh = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
        });
        if (cached) {
            event.waitUntil(fresh.catch(() => { /* offline: the cached copy is enough */ }));
            return cached;
        }
        return fresh;
    }));
});
