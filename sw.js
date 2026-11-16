// Permite usar la app sin internet.
// Primero intenta bajar la versión nueva; si no hay internet, usa la guardada.
const CACHE = 'juegos-maxi-v12';
const ARCHIVOS = [
  './', 'index.html', 'voz.html', 'manifest.json', 'css/estilos.css',
  'js/config.js', 'js/sonido.js', 'js/voz.js', 'js/app.js',
  'js/juegos/globos.js', 'js/juegos/animales.js', 'js/juegos/piano.js', 'js/juegos/colores.js',
  'js/juegos/formas.js', 'js/juegos/memotest.js', 'js/juegos/contar.js', 'js/juegos/sombras.js',
  'js/juegos/comida.js', 'js/juegos/pintar.js',
  'js/juegos/autos.js', 'js/juegos/dino.js', 'js/juegos/burbujas.js', 'js/juegos/vocales.js', 'js/juegos/quesigue.js', 'js/juegos/ordenar.js',
  'js/juegos/topos.js', 'js/juegos/atrapar.js', 'js/juegos/banda.js', 'js/juegos/numeros.js', 'js/juegos/mamas.js', 'js/juegos/rompecabezas.js', 'js/juegos/escribir.js',
  'iconos/icono-192.png', 'iconos/icono-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
