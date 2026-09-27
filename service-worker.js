// DG Sistemas - Service Worker
// Faz o site funcionar como app instalável no celular

const CACHE_NAME = "dg-sistemas-v1";

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

// Instala e faz cache dos arquivos principais
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ARQUIVOS).catch(err => {
        console.warn("Alguns arquivos não entraram no cache:", err);
      });
    })
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Estratégia: tenta pegar da internet, se falhar usa o cache
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(resposta => {
        if (resposta && resposta.status === 200 && resposta.type === "basic") {
          const copia = resposta.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
        }
        return resposta;
      })
      .catch(() => {
        return caches.match(event.request).then(resposta => {
          if (resposta) return resposta;
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
      })
  );
});
