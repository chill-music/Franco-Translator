/* FrancoAr service worker — offline-capable app shell (v3). */
const CACHE_NAME = "francoar-v3";
const PRECACHE = [
  "./",
  "./learn.html",
  "./privacy-policy.html",
  "./robots.txt",
  "./favicon.svg",
  "./manifest.webmanifest",
  "./apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-512-maskable.png",
  "./screenshots/home-1.png",
  "./screenshots/home-2.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        // Cache each file independently: one missing/404 file must not
        // break the entire install (addAll would fail as a whole).
        Promise.allSettled(
          PRECACHE.map((url) =>
            cache
              .add(new Request(url, { cache: "reload" }))
              .catch((err) => console.warn("[FrancoAr SW] precache failed:", url, err))
          )
        )
      )
      .then(() => {
        console.log("[FrancoAr SW] v3 install complete:", PRECACHE.length, "files");
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    // Cross-origin (Google Fonts): cache-first, then network.
    event.respondWith(
      caches.match(request, { ignoreVary: true }).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.type === "opaque") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  if (request.mode === "navigate") {
    // App shell: network first, cached page when offline, and keep the
    // cached shell fresh on every online visit.
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put("./", copy));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request, { ignoreSearch: true })
            .then((cached) => cached || caches.match("./", { ignoreSearch: true }))
        )
    );
    return;
  }

  // Same-origin static assets: cache-first, then network (result cached).
  event.respondWith(
    caches.match(request, { ignoreVary: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
        }
        return response;
      });
    })
  );
});
