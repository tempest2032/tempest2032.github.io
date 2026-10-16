const ROOT = new URL('./', self.location.href);
const PREFIX = `tempest2032:${ROOT.pathname}:`;
const CACHE = `${PREFIX}b75f8bfc`;
const FILES = ["./LICENSE", "./NOTICE", "./browser.js?v=b75f8bfc", "./favicon.png", "./icon-192.png", "./icon-512.png", "./index.html", "./manifest.webmanifest", "./preview.png", "./style.css?v=b75f8bfc", "./tempest2032.js?v=b75f8bfc", "./tempest2032_bg.wasm?v=b75f8bfc", "./touch.js?v=b75f8bfc"];
const ASSETS = new Set(FILES.map(file => new URL(file, ROOT).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache =>
    cache.addAll(FILES.map(file => new Request(new URL(file, ROOT), { cache: 'reload' })))));
});

// Wait for existing game tabs to close before switching their page/loader/WASM version.
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  const navigation = request.mode === 'navigate'
    && (url.pathname === ROOT.pathname || url.pathname === new URL('index.html', ROOT).pathname);
  if (!navigation && !ASSETS.has(url.href)) return;
  event.respondWith(caches.open(CACHE).then(async cache =>
    await cache.match(navigation ? new URL('index.html', ROOT).href : request) || fetch(request)));
});
