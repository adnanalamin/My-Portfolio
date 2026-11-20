/**
 * AL AMIN Portfolio — Safe Static Service Worker (Phase 20)
 * Strategy:
 * - Precache core static UI shell and offline.html fallback.
 * - Never cache cross-origin APIs (GitHub API, contact form endpoints, /api/*) or non-GET requests.
 * - Network-first for HTML navigations with offline fallback.
 * - Stale-while-revalidate for static local CSS, JS, and SVG/PNG assets.
 */

const CACHE_NAME = "alamin-portfolio-shell-v2";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./offline.html",
  "./404.html",
  "./css/style.css",
  "./css/animations.css",
  "./css/explorer.css",
  "./css/case-study.css",
  "./css/github.css",
  "./css/playground.css",
  "./css/architect.css",
  "./css/estimator.css",
  "./css/request.css",
  "./css/skills-graph.css",
  "./css/journey.css",
  "./css/build.css",
  "./css/decisions.css",
  "./css/security.css",
  "./css/performance.css",
  "./css/architecture.css",
  "./css/api-explorer.css",
  "./css/components-lab.css",
  "./css/design-playground.css",
  "./css/proposal-generator.css",
  "./css/resume-builder.css",
  "./css/recruiter-search.css",
  "./css/knowledge.css",
  "./project-architect.html",
  "./project-estimator.html",
  "./project-request.html",
  "./build.html",
  "./decisions.html",
  "./security.html",
  "./performance.html",
  "./architecture.html",
  "./api-explorer.html",
  "./components.html",
  "./design-playground.html",
  "./proposal-generator.html",
  "./resume.html",
  "./recruiter-search.html",
  "./knowledge.html",
  "./js/config.js",
  "./js/theme.js",
  "./js/brand.js",
  "./js/modes.js",
  "./js/components.js",
  "./js/ux.js",
  "./js/architect.js",
  "./js/estimator.js",
  "./js/request.js",
  "./js/skills-graph.js",
  "./js/journey.js",
  "./js/build.js",
  "./js/decisions.js",
  "./js/security.js",
  "./js/performance.js",
  "./js/architecture.js",
  "./js/api-explorer.js",
  "./js/components-lab.js",
  "./js/design-playground.js",
  "./js/proposal-generator.js",
  "./js/resume-builder.js",
  "./js/recruiter-search.js",
  "./js/knowledge.js",
  "./js/animations.js",
  "./js/main.js",
  "./assets/icons/favicon.svg",
  "./assets/icons/pwa-192x192.png",
  "./assets/icons/pwa-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(new Request(url, { cache: "reload" })).catch(() => null)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key.startsWith("alamin-portfolio-"))
            .map((staleKey) => caches.delete(staleKey))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!request || request.method !== "GET") return;

  let reqUrl;
  try {
    reqUrl = new URL(request.url);
  } catch (_err) {
    return;
  }

  // Strictly skip cross-origin traffic, Vite dev modules, and dynamic API routes
  if (reqUrl.origin !== self.location.origin) return;
  if (
    reqUrl.pathname.startsWith("/api/") ||
    reqUrl.pathname.startsWith("/@") ||
    reqUrl.pathname.startsWith("/node_modules/")
  ) {
    return;
  }

  // HTML page navigations: network-first, fallback to cached page or offline.html
  if (request.mode === "navigate" || reqUrl.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return (await caches.match("./offline.html")) || Response.error();
        })
    );
    return;
  }

  // Local static code assets (CSS/JS): network-first with cache fallback to prevent stale code mismatches
  const isCodeAsset = /\.(css|js|webmanifest)$/i.test(reqUrl.pathname);
  if (isCodeAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response && response.ok && response.type === "basic") {
            cache.put(request, response.clone()).catch(() => {});
          }
          return response;
        } catch (_err) {
          const cached = await cache.match(request);
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // Static media/icon assets: stale-while-revalidate
  const isMediaAsset = /\.(svg|png|jpg|jpeg|webp|woff2?|pdf)$/i.test(reqUrl.pathname);
  if (!isMediaAsset) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === "basic") {
            cache.put(request, response.clone()).catch(() => {});
          }
          return response;
        })
        .catch(() => null);

      if (cached) {
        return cached;
      }
      const fresh = await networkFetch;
      return fresh || Response.error();
    })
  );
});
