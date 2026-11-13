
const CACHE_NAME = "tycf-shell-v4";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/admin.html",
  "/dashboard.html",
  "/manifest.webmanifest",
  "/tycf-app-icon-512.png",
  "/tycf-logo-cropped-1.png",
  "/offline.html"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }

        return response;
      } catch {
        return (
          await caches.match(request) ||
          await caches.match("/offline.html")
        );
      }
    })());

    return;
  }

  if (
    ["style", "script", "image", "font"].includes(
      request.destination
    )
  ) {
    event.respondWith((async () => {
      const cached = await caches.match(request);

      if (cached) return cached;

      try {
        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }

        return response;
      } catch {
        return Response.error();
      }
    })());
  }
});


self.addEventListener("push", event => {
  event.waitUntil((async () => {
    let data = {};
    try { data = event.data ? event.data.json() : {}; }
    catch { data = { body: event.data ? event.data.text() : "A new donation order has arrived." }; }
    await self.registration.showNotification(data.title || "TYCF Food Donation", {
      body: data.body || "A new donation order has arrived.",
      icon: "/tycf-app-icon-512.png",
      badge: "/tycf-app-icon-512.png",
      tag: data.tag || "tycf-new-order",
      data: { url: data.url || "/dashboard.html" },
      vibrate: [200, 100, 200]
    });
  })());
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/dashboard.html", self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        await client.focus();
        if ("navigate" in client) await client.navigate(target);
        return;
      }
    }
    await self.clients.openWindow(target);
  })());
});
