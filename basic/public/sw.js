const CACHE_NAME = "basic-instinct-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/logo.png",
];

// ── Installation : mise en cache des assets statiques ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

// ── Activation : suppression des anciennes caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

// ── Fetch : stratégie Cache-First pour assets, Network-First pour API ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Images Unsplash → cache réseau avec fallback
  if (url.hostname === "images.unsplash.com") {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  // Assets locaux → Cache-First
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request)),
    );
    return;
  }
});

// ── Push Notifications ──
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {
    title: "Basic Instinct",
    body: "Nouvelle activité sur votre compte.",
    icon: "/logo.png",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? "/logo.png",
      badge: "/logo.png",
      vibrate: [200, 100, 200],
      data: { url: data.url ?? "/" },
    }),
  );
});

// ── Clic sur la notification ──
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url ?? "/"));
});
