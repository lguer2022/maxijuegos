// 11. Autos: manejar en una pista. Acelerador para ir, freno para frenar.
// A veces aparece un animal en la pista: hay que bajar la velocidad y tocar bocina para que se vaya.
App.registrar({
  id: 'autos', nombre: 'Autos', emoji: '🏎️', color: '#06b6d4',
  fondo: '#7ccf6b',
  iniciar(area, api) {
    area.innerHTML = `
      <div class="capa elegir-auto"></div>
      <div class="capa velocimetro"><span>🐢</span><div class="barra-vel"><i></i></div><span>🐇</span></div>
      <div class="marcador" style="left:auto;right:16px">🏁 <span>0</span></div>
      <button class="capa btn-juego bocina" style="left:16px;bottom:16px" aria-label="Bocina">📯</button>
      <button class="capa btn-juego freno" aria-label="Freno"><span>🛑</span>Freno</button>
      <button class="capa btn-juego pedal" style="right:16px;bottom:16px" aria-label="Acelerador"><span>🦶</span>¡Dale!</button>`;
    const span = area.querySelector('.marcador span');
    const pedal = area.querySelector('.pedal');
    const freno = area.querySelector('.freno');
    const bocinaBtn = area.querySelector('.bocina');
    const barra = area.querySelector('.barra-vel i');
    const autos = ['🏎️', '🚙', '🚒', '🚜'];
    let auto = autos[0];
    const sel = area.querySelector('.elegir-auto');
    autos.forEach((a, i) => {
      const b = document.createElement('button');
      b.textContent = a;
      if (i === 0) b.classList.add('elegida');
      b.addEventListener('click', () => {
        auto = a;
        api.sonido.click();
        sel.querySelectorAll('button').forEach(x => x.classList.remove('elegida'));
        b.classList.add('elegida');
      });
      sel.appendChild(b);
    });

    const bichos = [
      { e: '🐄', id: 'vaca', n: 'la vaca' }, { e: '🐑', id: 'oveja', n: 'la oveja' },
      { e: '🐔', id: 'gallina', n: 'la gallina' }, { e: '🦆', id: 'pato', n: 'el pato' },
      { e: '🐕', id: 'perro', n: 'el perro' }, { e: '🐖', id: 'cerdo', n: 'el chanchito' },
      { e: '🐎', id: 'caballo', n: 'el caballo' }, { e: '🐈', id: 'gato', n: 'el gato' }
    ];

    // ---------- Pista ----------
    let pts = [], largos = [], total = 1, ancho = 50, fondo = null, centro = { x: 0, y: 0 };
    function armar(L) {
      const W = L.w, H = L.h;
      ancho = Math.max(46, Math.min(W, H) * 0.13);
      const cx0 = W / 2, cy0 = H / 2 + 20;
      centro = { x: cx0, y: cy0 };
      const rx = W / 2 - ancho - 24, ry = (H / 2 - ancho - 50) / 1.2;
      const N = 500;
      pts = []; largos = [0];
      for (let i = 0; i < N; i++) {
        const a = i / N * Math.PI * 2;
        pts.push({ x: cx0 + rx * Math.cos(a), y: cy0 + ry * (Math.sin(a) + 0.3 * Math.sin(2 * a)) });
      }
      for (let i = 1; i <= N; i++) {
        const p = pts[i - 1], q = pts[i % N];
        largos.push(largos[i - 1] + Math.hypot(q.x - p.x, q.y - p.y));
      }
      // si cambió el tamaño, mantener las posiciones en proporción
      const viejo = total;
      total = largos[N];
      if (viejo > 1) {
        const f = total / viejo;
        s *= f;
        estrellas.forEach(e => { e.s *= f; });
        if (bicho) bicho.s *= f;
      }
      dibujarFondo(L);
      if (estrellas.length === 0) ponerEstrellas();
    }

    function enPista(s) {
      s = ((s % total) + total) % total;
      let lo = 0, hi = largos.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (largos[m] <= s) lo = m; else hi = m; }
      const p = pts[lo % pts.length], q = pts[(lo + 1) % pts.length];
      const f = (s - largos[lo]) / ((largos[lo + 1] - largos[lo]) || 1);
      return { x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f, ang: Math.atan2(q.y - p.y, q.x - p.x) };
    }
    const adelante = destino => ((destino - s) % total + total) % total;   // distancia por la pista

    function dibujarFondo(L) {
      const d = window.devicePixelRatio || 1;
      fondo = document.createElement('canvas');
      fondo.width = L.w * d; fondo.height = L.h * d;
      const c = fondo.getContext('2d');
      c.setTransform(d, 0, 0, d, 0, 0);
      c.fillStyle = '#7ccf6b'; c.fillRect(0, 0, L.w, L.h);
      c.fillStyle = 'rgba(255,255,255,.08)';
      for (let i = 0; i < 40; i++) { c.beginPath(); c.arc(Math.random() * L.w, Math.random() * L.h, 10 + Math.random() * 30, 0, 7); c.fill(); }
      const deco = ['🌳', '🌲', '🌷', '🌼', '🏠', '🌻', '🌳'];
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#000';
      for (let k = 0, puestas = 0; k < 300 && puestas < 16; k++) {
        const x = 30 + Math.random() * (L.w - 60), y = 90 + Math.random() * (L.h - 120);
        if (x > L.w - 260 && y > L.h - 150) continue;   // lugar de los pedales
        if (x < 110 && y > L.h - 110) continue;         // lugar de la bocina
        let lejos = true;
        for (let i = 0; i < pts.length; i += 5) if (Math.hypot(pts[i].x - x, pts[i].y - y) < ancho * 1.1) { lejos = false; break; }
        if (!lejos) continue;
        c.font = api.fuenteEmoji(26 + Math.random() * 16);
        c.fillText(api.azar(deco), x, y);
        puestas++;
      }
      const camino = () => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.closePath(); };
      c.lineJoin = 'round';
      camino(); c.lineWidth = ancho + 16; c.strokeStyle = '#fff'; c.stroke();
      c.setLineDash([18, 18]); camino(); c.strokeStyle = '#ef4444'; c.stroke();
      c.setLineDash([]); camino(); c.lineWidth = ancho; c.strokeStyle = '#4b5563'; c.stroke();
      c.setLineDash([22, 18]); camino(); c.lineWidth = 4; c.strokeStyle = '#fde047'; c.stroke();
      c.setLineDash([]);
      const p0 = pts[0], p1 = pts[1];
      const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      c.save(); c.translate(p0.x, p0.y); c.rotate(ang);
      const filas = 6, lado = ancho / filas;
      for (let i = 0; i < filas; i++) for (let j = 0; j < 2; j++) {
        c.fillStyle = (i + j) % 2 ? '#111' : '#fff';
        c.fillRect(j * lado - lado, -ancho / 2 + i * lado, lado, lado);
      }
      c.restore();
      c.fillStyle = '#000';
      c.font = api.fuenteEmoji(34);
      c.fillText('🏁', p0.x + ancho * 0.9, p0.y);
    }

    // ---------- Estado ----------
    let s = 0, v = 0, vueltas = 0, estrellas = [], motor = null;
    let bicho = null, proximoBicho = 5, sacudon = 0, avisos = 0;
    const apretando = new Set(), frenando = new Set();
    const vmax = () => total / 6;      // una vuelta en ~6 segundos a fondo
    const LENTO = 0.4;                 // por debajo de esto, el auto va "despacito"

    function ponerEstrellas() {
      estrellas = [];
      for (let i = 0; i < 4; i++) estrellas.push({ s: total * (0.15 + i * 0.2 + Math.random() * 0.08), tomada: false });
    }

    const L = api.lienzo(area, armar);

    // ---------- Controles ----------
    function apretar(e) {
      if (e.target.closest('.bocina, .elegir-auto')) return;
      if (!motor) { motor = api.sonido.motor(); api.alSalir(() => motor.parar()); }
      if (e.target.closest('.freno')) { frenando.add(e.pointerId); freno.classList.add('apretado'); return; }
      apretando.add(e.pointerId);
      pedal.classList.add('apretado');
    }
    function soltar(e) {
      apretando.delete(e.pointerId); frenando.delete(e.pointerId);
      if (!apretando.size) pedal.classList.remove('apretado');
      if (!frenando.size) freno.classList.remove('apretado');
    }
    area.addEventListener('pointerdown', apretar);
    area.addEventListener('pointerup', soltar);
    area.addEventListener('pointercancel', soltar);
    area.addEventListener('pointerleave', soltar);

    bocinaBtn.addEventListener('pointerdown', () => {
      api.sonido.bocina();
      if (!bicho || bicho.huye) return;
      if (adelante(bicho.s) > ancho * 10) return;   // está muy lejos todavía
      const b = bicho, despacito = v < vmax() * LENTO;
      b.huye = 0.001;
      bocinaBtn.classList.remove('pulsa');
      let dura = 1;
      api.despues(250, () => { dura = api.sonido.animal(b.id); });
      api.estrella(bocinaBtn);
      api.despues(450, () => api.despues(Math.min(dura, 2.2) * 1000, () => api.decir(despacito
        ? `¡Muy bien! Frenaste y tocaste bocina. ¡Chau ${b.n.split(' ')[1]}!`
        : `¡Se fue ${b.n}! ¡Muy bien!`)));
      proximoBicho = 6 + Math.random() * 5;
    });

    function nuevoBicho() {
      const b = api.azar(bichos);
      bicho = { ...b, s: (s + total * (0.35 + Math.random() * 0.2)) % total, huye: 0, avisado: false, susto: 0 };
      // que no quede arriba de una estrella
      estrellas.forEach(e => { if (Math.abs(e.s - bicho.s) < ancho * 1.5) e.tomada = true; });
    }

    // ---------- Bucle ----------
    api.cuadro((dt, t) => {
      const vm = vmax();
      if (frenando.size) v = Math.max(0, v - vm * 1.8 * dt);
      else if (apretando.size) v = Math.min(vm, v + vm * 0.8 * dt);
      else v = Math.max(0, v - vm * 0.4 * dt);

      // Animales en la pista
      if (!bicho && v > 0) { proximoBicho -= dt; if (proximoBicho <= 0) nuevoBicho(); }
      if (bicho && !bicho.huye) {
        const d = adelante(bicho.s), hueco = ancho * 1.1;
        if (!bicho.avisado && d < ancho * 8) {
          bicho.avisado = true;
          bocinaBtn.classList.add('pulsa');
          avisos++;
          api.decir(avisos <= 3 ? `¡Cuidado! ¡Hay ${b2(bicho.n)} en la pista! Frená y tocá bocina.` : '¡Cuidado! ¡Bocina!');
        }
        if (d - v * dt < hueco) {
          // el auto no puede pasar por encima del animal
          if (!bicho.parado) {
            bicho.parado = true;
            if (v > vm * LENTO) {
              api.sonido.chirrido();
              sacudon = 0.5; bicho.susto = 0.6;
              api.decir('¡Uy! ¡Muy rápido! Hay que frenar y tocar bocina.');
            } else {
              api.decir('¡Bien, frenaste! Ahora tocá la bocina.');
            }
            bicho.recordar = 5;
          } else if (apretando.size && (bicho.recordar -= dt) <= 0) {
            bicho.recordar = 5;
            api.decir('¡Tocá la bocina!');
          }
          v = 0;
          s = ((bicho.s - hueco) % total + total) % total;
        }
      }
      if (bicho && bicho.huye) { bicho.huye += dt; if (bicho.huye > 1.2) bicho = null; }

      s += v * dt;
      if (motor) motor.set(v / vm);
      barra.style.width = Math.round(v / vm * 100) + '%';
      barra.style.background = v < vm * LENTO ? '#22c55e' : (v < vm * 0.75 ? '#facc15' : '#ef4444');

      if (s >= total) {
        s -= total;
        vueltas++;
        span.textContent = vueltas;
        if (vueltas % 3 === 0) api.festejo('¡Ganaste la carrera!');
        else { api.sonido.bien(); api.estrella(area.querySelector('.marcador')); api.decir(`¡Vuelta ${vueltas}!`); }
        ponerEstrellas();
      }
      for (const e of estrellas) {
        if (e.tomada) continue;
        const d = adelante(e.s);
        if (d < 18 || d > total - 6) {
          e.tomada = true;
          api.sonido.pop();
          const p = enPista(e.s), r = L.cv.getBoundingClientRect();
          api.chispa(r.left + p.x, r.top + p.y, '#facc15');
        }
      }

      // ---------- Dibujo ----------
      const cx = L.cx;
      if (fondo) cx.drawImage(fondo, 0, 0, L.w, L.h);
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = '#000';
      cx.font = api.fuenteEmoji(ancho * 0.55);
      for (const e of estrellas) {
        if (e.tomada) continue;
        const p = enPista(e.s), k = 1 + Math.sin(t / 200) * 0.12;
        cx.save(); cx.translate(p.x, p.y); cx.scale(k, k); cx.fillText('⭐', 0, 0); cx.restore();
      }
      // animal
      if (bicho) {
        const p = enPista(bicho.s);
        const nx = -Math.sin(p.ang), ny = Math.cos(p.ang);
        const lado = (nx * (p.x - centro.x) + ny * (p.y - centro.y)) > 0 ? 1 : -1;
        const fuera = bicho.huye ? bicho.huye * ancho * 2.2 : 0;
        const x = p.x + nx * lado * fuera, y = p.y + ny * lado * fuera;
        const salto = bicho.huye ? Math.abs(Math.sin(bicho.huye * 14)) * 10 : (bicho.susto > 0 ? Math.abs(Math.sin(t / 40)) * 14 : Math.abs(Math.sin(t / 300)) * 3);
        bicho.susto = Math.max(0, bicho.susto - dt);
        cx.globalAlpha = bicho.huye ? Math.max(0, 1 - bicho.huye / 1.2) : 1;
        cx.save(); cx.translate(x, y - salto);
        if (bicho.huye && lado * nx > 0) cx.scale(-1, 1);   // que mire para donde se va
        cx.font = api.fuenteEmoji(ancho * 0.95);
        cx.fillText(bicho.e, 0, 0);
        cx.restore();
        if (!bicho.huye && bicho.avisado && Math.floor(t / 300) % 2) {
          cx.font = api.fuenteEmoji(ancho * 0.6);
          cx.fillText('⚠️', x, y - ancho * 0.95);
        }
        cx.globalAlpha = 1;
      }
      // auto
      const p = enPista(s), tam = ancho * 1.1;
      const temblor = sacudon > 0 ? Math.sin(t / 20) * 4 : 0;
      sacudon = Math.max(0, sacudon - dt);
      cx.fillStyle = 'rgba(0,0,0,.25)';
      cx.beginPath(); cx.ellipse(p.x, p.y + tam * 0.3, tam * 0.45, tam * 0.15, 0, 0, 7); cx.fill();
      cx.save();
      cx.translate(p.x + temblor, p.y - (v > 0 ? Math.abs(Math.sin(t / 60)) * 2 : 0));
      cx.rotate(p.ang);
      if (Math.cos(p.ang) < 0) cx.scale(1, -1);
      cx.scale(-1, 1);   // los emojis de autos miran a la izquierda: los damos vuelta
      cx.fillStyle = '#000';
      cx.font = api.fuenteEmoji(tam);
      cx.fillText(auto, 0, 0);
      cx.restore();
      if (apretando.size && v > 10) {
        cx.fillStyle = '#000'; cx.globalAlpha = 0.5; cx.font = api.fuenteEmoji(tam * 0.35);
        cx.fillText('💨', p.x - Math.cos(p.ang) * tam * 0.6, p.y - Math.sin(p.ang) * tam * 0.6);
        cx.globalAlpha = 1;
      }
    });

    // "la vaca" → "una vaca", "el pato" → "un pato"
    function b2(n) { return n.replace(/^la /, 'una ').replace(/^el /, 'un '); }

    api.decir('¡Apretá el botón verde para acelerar y el rojo para frenar!');
  }
});
