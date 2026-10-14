// DG Sistemas - Service Worker
const CACHE_NAME = "dg-sistemas-v4";  // ← subiu de v3 pra v4 (força reset total)

const ARQUIVOS = [
  "./",
  "./index.html",
  "./jogos.html",
  "./sumulas.html",
  "./sumula-offline.html",
  "./sumula-publica.html",
  "./logo.png",
  "./icone.png",
  "./fundo.png",
  "./patrocinio.png",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ARQUIVOS.map(url => new Request(url, { cache: "reload" })))
        .catch(err => console.warn("Alguns arquivos não entraram no cache:", err));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const ehHTML =
    event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").includes("text/html");

  if (ehHTML) {
    event.respondWith(
      fetch(event.request, { cache: "reload" })
        .then(resposta => {
          const copia = resposta.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
          return resposta;
        })
        .catch(() =>
          caches.match(event.request).then(r => r || caches.match("./index.html"))
        )
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(resposta => {
        if (resposta && resposta.status === 200 && resposta.type === "basic") {
          const copia = resposta.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
        }
        return resposta;
      })
      .catch(() =>
        caches.match(event.request).then(resposta => {
          if (resposta) return resposta;
          if (event.request.mode === "navigate") return caches.match("./index.html");
        })
      )
  );
});
