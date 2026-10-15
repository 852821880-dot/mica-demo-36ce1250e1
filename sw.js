const V = 'mica-demo-20261015112153';
const FILES = ["./", "index.html", "manifest.webmanifest", "assets/entry.mp4", "assets/greet.mp4", "assets/icon-180.png", "assets/idle.mp4", "assets/p1.jpg", "assets/p2.jpg", "assets/p3.jpg", "assets/p4.jpg", "assets/p5.jpg", "assets/p6.jpg", "assets/p7.jpg", "assets/p8.jpg", "assets/p9.jpg", "assets/roboto-latin.woff2", "assets/speak.mp4", "assets/think.mp4", "assets/wave-mask.png", "assets/wave.mp4"];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request;
  // 页面本身：有网先取新的（改了 demo 马上生效），断网才用缓存；素材一律缓存优先
  if (r.mode === 'navigate') { e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(ca => ca.put(r, c)); return res; }).catch(() => caches.match('index.html'))); return; }
  // 视频要支持 Range 请求（iOS 不带 Range 播不了），所以不能直接吐缓存里的整份响应
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(async hit => {
    if (!hit) return fetch(r);
    const range = r.headers.get('range');
    if (!range) return hit;
    const buf = await hit.arrayBuffer(); const m = /bytes=(\d+)-(\d*)/.exec(range); const s = +m[1], t = m[2] ? +m[2] : buf.byteLength - 1;
    return new Response(buf.slice(s, t + 1), { status: 206, headers: { 'Content-Type': hit.headers.get('Content-Type') || 'video/mp4', 'Content-Range': 'bytes ' + s + '-' + t + '/' + buf.byteLength, 'Content-Length': t - s + 1 } });
  }));
});
