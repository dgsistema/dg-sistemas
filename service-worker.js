// DG Sistemas - Service Worker
// Faz o site funcionar como app instalável no celular

const CACHE_NAME = "dg-sistemas-v2";  // <-- MUDOU de v1 para v2 (força instalação)

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
      // Busca ignorando cache HTTP, para pegar sempre a versão fresca
      return cache.addAll(ARQUIVOS.map(url => new Request(url, { cache: "reload" })))
        .catch(err => {
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

// Estratégia: HTML sempre vem da rede (ignorando cache HTTP), resto network-first
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const ehHTML =
    event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").includes("text/html");

  // -------- HTML: sempre rede, ignora cache HTTP --------
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

  // -------- Demais arquivos: network-first normal --------
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
