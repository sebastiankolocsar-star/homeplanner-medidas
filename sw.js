/* Homeplanner · Medidas — funciona sin internet */
const VERSION = "hp-medidas-20261125223659";
const PROPIOS = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png"];
const EXTERNOS = ["https://cdn.jsdelivr.net/npm/@azure/msal-browser@3.30.0/lib/msal-browser.min.js", "https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.3.0/files/playfair-display-latin-400-normal.woff2", "https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.3.0/files/playfair-display-latin-700-normal.woff2", "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js", "https://cdn.jsdelivr.net/npm/@expo-google-fonts/playfair-display@0.4.2/400Regular/PlayfairDisplay_400Regular.ttf", "https://cdn.jsdelivr.net/npm/@expo-google-fonts/playfair-display@0.4.2/700Bold/PlayfairDisplay_700Bold.ttf"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(async c => {
    await c.addAll(PROPIOS);
    await Promise.all(EXTERNOS.map(u => c.add(new Request(u, {mode: "cors"})).catch(() => {})));
  }).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const propio = url.origin === location.origin;
  if (!propio && !EXTERNOS.includes(url.href)) return;
  e.respondWith(
    caches.match(propio ? req : url.href, {ignoreSearch: propio}).then(r => r ||
      fetch(propio ? req : new Request(url.href, {mode: "cors"})).then(res => {
        if (res.ok && !propio) { const copia = res.clone(); caches.open(VERSION).then(c => c.put(url.href, copia)); }
        return res;
      }).catch(() => req.mode === "navigate" ? caches.match("index.html") : Response.error()))
  );
});
