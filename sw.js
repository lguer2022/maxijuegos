// Guarda todos los archivos para que la app funcione sin internet.
// Si cambiás algo, subí el número de versión para que el celular descargue lo nuevo.
const CACHE = 'juegos-maxi-v1';
const ARCHIVOS = [
  './', 'index.html', 'manifest.json', 'css/estilos.css',
  'js/config.js', 'js/sonido.js', 'js/app.js',
  'js/juegos/globos.js', 'js/juegos/animales.js', 'js/juegos/piano.js', 'js/juegos/colores.js',
  'js/juegos/formas.js', 'js/juegos/memotest.js', 'js/juegos/contar.js', 'js/juegos/sombras.js',
  'js/juegos/comida.js', 'js/juegos/pintar.js',
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
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
