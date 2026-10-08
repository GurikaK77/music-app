/* რიტმი service worker: აპი ოფლაინში + შენახული აუდიო */
const VERSION = 'ritmi-v1';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'];
const RUNTIME = 'ritmi-runtime';   // ფონტები, YouTube ქავერები
const AUDIO = 'ritmi-audio';       // ოფლაინისთვის შენახული აუდიო ლინკები

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = [VERSION, RUNTIME, AUDIO];
    for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Range მოთხოვნების მხარდაჭერა (Safari/iOS აუდიოსთვის)
async function withRange(res, req) {
  const range = req.headers.get('range');
  if (!range || res.type === 'opaque' || res.status !== 200) return res;
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const size = buf.byteLength;
  const start = m[1] ? +m[1] : 0;
  const end = m[2] ? Math.min(+m[2], size - 1) : size - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Accept-Ranges': 'bytes'
    }
  });
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return hit || (await net) || new Response('', { status: 504 });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 1) შენახული აუდიო
  if (req.destination === 'audio' || req.destination === 'video' || req.headers.has('range')) {
    e.respondWith((async () => {
      const c = await caches.open(AUDIO);
      const hit = await c.match(req.url);
      if (hit) return withRange(hit, req);
      return fetch(req);
    })());
    return;
  }

  // 2) აპის გვერდები: ჯერ ქეში, ფონზე განახლება; ოფლაინ ნავიგაცია → index.html
  if (url.origin === location.origin) {
    if (req.mode === 'navigate') {
      e.respondWith((async () => {
        try {
          const res = await fetch(req);
          const c = await caches.open(VERSION); c.put('index.html', res.clone());
          return res;
        } catch {
          return (await caches.match('index.html')) || (await caches.match('./'));
        }
      })());
      return;
    }
    e.respondWith(staleWhileRevalidate(req, VERSION));
    return;
  }

  // 3) ფონტები და YouTube ქავერები
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || /(^|\.)ytimg\.com$/.test(url.hostname)) {
    e.respondWith(staleWhileRevalidate(req, RUNTIME));
  }
  // დანარჩენი (YouTube player, oEmbed) პირდაპირ ქსელით
});
