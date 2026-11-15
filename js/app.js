// Motor del centro de juegos: menú, estrellas, confeti, festejos y navegación.

// ---------- Confeti ----------
const Confeti = (() => {
  const cv = document.getElementById('confeti');
  const cx = cv.getContext('2d');
  const colores = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff8fab', '#ff924c', '#2ec4b6'];
  let ps = [], corriendo = false;

  function ajustar() {
    const d = window.devicePixelRatio || 1;
    cv.width = innerWidth * d; cv.height = innerHeight * d;
    cx.setTransform(d, 0, 0, d, 0, 0);
  }
  addEventListener('resize', ajustar); ajustar();

  function lanzar(x, y, n, fuerza, color) {
    for (let i = 0; i < n; i++) {
      ps.push({
        x, y,
        vx: (Math.random() - 0.5) * fuerza,
        vy: -Math.random() * fuerza - 2,
        r: 4 + Math.random() * 6,
        c: color && Math.random() < 0.6 ? color : colores[(Math.random() * colores.length) | 0],
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        vida: 90 + Math.random() * 60,
        circulo: Math.random() < 0.4
      });
    }
    if (!corriendo) { corriendo = true; requestAnimationFrame(paso); }
  }

  function paso() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    ps = ps.filter(p => p.vida > 0 && p.y < innerHeight + 40);
    for (const p of ps) {
      p.vy += 0.25; p.vx *= 0.99;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vida--;
      cx.globalAlpha = Math.min(1, p.vida / 30);
      cx.fillStyle = p.c;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot);
      if (p.circulo) { cx.beginPath(); cx.arc(0, 0, p.r / 1.6, 0, 6.3); cx.fill(); }
      else cx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      cx.restore();
    }
    cx.globalAlpha = 1;
    if (ps.length) requestAnimationFrame(paso);
    else { corriendo = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  return {
    chispa(x, y, color) { lanzar(x, y, 20, 11, color); },
    lluvia() { for (let i = 0; i < 6; i++) lanzar(innerWidth * (i + 0.5) / 6, innerHeight * 0.4, 28, 17); }
  };
})();

// ---------- App ----------
const App = (() => {
  const $ = s => document.querySelector(s);
  const juegos = [];
  let actual = null;
  let gen = 0;            // cambia cada vez que se entra/sale de un juego
  let timers = [];
  let estrellas = 0;
  try { estrellas = parseInt(localStorage.getItem('maxi-estrellas'), 10) || 0; } catch (e) {}

  const menu = $('#menu'), area = $('#juego'), titulo = $('#titulo');
  const btnCasa = $('#btn-casa'), btnSonido = $('#btn-sonido');

  function mostrarEstrellas(animar) {
    $('#num-estrellas').textContent = estrellas;
    if (animar) {
      const e = $('#estrellas');
      e.classList.remove('salto'); void e.offsetWidth; e.classList.add('salto');
    }
  }
  function sumarEstrella() {
    estrellas++;
    try { localStorage.setItem('maxi-estrellas', estrellas); } catch (e) {}
    mostrarEstrellas(true);
  }

  const frasesFestejo = () => [
    `¡Muy bien, ${CONFIG.nombre}!`, '¡Genial!', '¡Excelente!', `¡Bravo, ${CONFIG.nombre}!`,
    '¡Sos un campeón!', '¡Lo lograste!', '¡Increíble!'
  ];

  function centro(el) {
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }

  // Herramientas que reciben los juegos
  const api = {
    sonido: Sonido,
    decir: t => Voz.decir(t),
    despues(ms, fn) {
      const g = gen;
      const id = setTimeout(() => { if (g === gen) fn(); }, ms);
      timers.push(() => clearTimeout(id));
      return id;
    },
    cada(ms, fn) {
      const g = gen;
      const id = setInterval(() => { if (g === gen) fn(); }, ms);
      timers.push(() => clearInterval(id));
      return id;
    },
    azar: arr => arr[(Math.random() * arr.length) | 0],
    mezclar(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
    entero: (a, b) => a + ((Math.random() * (b - a + 1)) | 0),
    centro,
    chispa(x, y, color) { Confeti.chispa(x, y, color); },
    // Premio chico: una estrella + chispas donde está el elemento
    estrella(el, color) {
      sumarEstrella();
      if (el) { const [x, y] = centro(el); Confeti.chispa(x, y, color); }
    },
    // Premio grande: lluvia de confeti, fanfarria y voz
    festejo(texto) {
      texto = texto || api.azar(frasesFestejo());
      sumarEstrella();
      Sonido.fanfarria();
      Confeti.lluvia();
      Voz.decir(texto);
      const d = document.createElement('div');
      d.className = 'festejo';
      d.innerHTML = `<div><span class="festejo-emoji">${api.azar(['🌟', '🏆', '🎉', '🥳', '🦄', '🚀'])}</span><span>${texto}</span></div>`;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 2300);
    }
  };

  function construirMenu() {
    const grilla = $('#grilla');
    juegos.forEach((j, i) => {
      const b = document.createElement('button');
      b.className = 'tarjeta';
      b.style.setProperty('--c', j.color);
      b.style.animationDelay = (i * 0.06) + 's';
      b.innerHTML = `<span class="emo" style="animation-delay:${-i * 0.3}s">${j.emoji}</span><span class="nombre">${j.nombre}</span>`;
      b.addEventListener('click', () => { Sonido.click(); abrir(j); });
      grilla.appendChild(b);
    });
  }

  function abrir(j) {
    gen++;
    actual = j;
    menu.style.display = 'none';
    area.style.display = 'block';
    area.innerHTML = '';
    area.className = 'area-juego juego-' + j.id;
    area.style.background = j.fondo || '';
    titulo.textContent = j.emoji + ' ' + j.nombre;
    btnCasa.hidden = false;
    history.pushState({ juego: j.id }, '');
    j.iniciar(area, api);
  }

  function cerrar(desdeHistorial) {
    if (!actual) return;
    gen++;
    timers.forEach(f => f()); timers = [];
    if (actual.detener) actual.detener();
    actual = null;
    Voz.callar();
    area.innerHTML = '';
    area.style.display = 'none';
    menu.style.display = '';
    titulo.textContent = 'Los juegos de ' + CONFIG.nombre;
    btnCasa.hidden = true;
    if (!desdeHistorial) history.back();
  }

  function actualizarBotonSonido() { btnSonido.textContent = Sonido.silencio() ? '🔇' : '🔊'; }

  function arrancar() {
    document.title = 'Los juegos de ' + CONFIG.nombre;
    titulo.textContent = 'Los juegos de ' + CONFIG.nombre;
    $('#inicio-titulo').textContent = `¡Hola, ${CONFIG.nombre}!`;
    construirMenu();
    mostrarEstrellas();
    actualizarBotonSonido();

    btnCasa.addEventListener('click', () => { Sonido.click(); cerrar(false); });
    btnSonido.addEventListener('click', () => { Sonido.alternar(); if (Sonido.silencio()) Voz.callar(); else { Sonido.click(); Voz.desbloquear(); } actualizarBotonSonido(); });
    addEventListener('popstate', () => { if (actual) cerrar(true); });

    $('#btn-jugar').addEventListener('click', () => {
      Sonido.desbloquear();
      Voz.desbloquear();
      Sonido.fanfarria();
      Voz.decir(`¡Hola, ${CONFIG.nombre}! ¿A qué querés jugar?`);
      const ini = $('#inicio');
      ini.classList.add('chau');
      setTimeout(() => ini.remove(), 500);
      // pantalla completa en celulares y tablets
      if (matchMedia('(pointer: coarse)').matches && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    });

    // Evita el menú de "mantener apretado" y el zoom con dos dedos
    addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('gesturestart', e => e.preventDefault());

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  document.addEventListener('DOMContentLoaded', arrancar);

  return { registrar(j) { juegos.push(j); } };
})();
