// 11. Autos: manejar un auto en una pista (mantener apretado para acelerar)
App.registrar({
  id: 'autos', nombre: 'Autos', emoji: '🏎️', color: '#06b6d4',
  fondo: '#7ccf6b',
  iniciar(area, api) {
    area.innerHTML = `
      <div class="capa elegir-auto"></div>
      <div class="marcador" style="left:auto;right:16px">🏁 <span>0</span></div>
      <button class="capa btn-juego bocina" style="left:16px;bottom:16px" aria-label="Bocina">📯</button>
      <button class="capa btn-juego pedal" style="right:16px;bottom:16px"><span>🦶</span>¡Dale!</button>`;
    const span = area.querySelector('.marcador span');
    const pedal = area.querySelector('.pedal');
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

    // ---------- Pista ----------
    let pts = [], largos = [], total = 1, ancho = 50, fondo = null;
    function armar(L) {
      const W = L.w, H = L.h;
      ancho = Math.max(46, Math.min(W, H) * 0.13);
      const cx0 = W / 2, cy0 = H / 2 + 20;
      const rx = W / 2 - ancho - 24, ry = (H / 2 - ancho - 40) / 1.2;
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
      total = largos[N];
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

    function dibujarFondo(L) {
      const d = window.devicePixelRatio || 1;
      fondo = document.createElement('canvas');
      fondo.width = L.w * d; fondo.height = L.h * d;
      const c = fondo.getContext('2d');
      c.setTransform(d, 0, 0, d, 0, 0);
      c.fillStyle = '#7ccf6b'; c.fillRect(0, 0, L.w, L.h);
      // manchitas de pasto
      c.fillStyle = 'rgba(255,255,255,.08)';
      for (let i = 0; i < 40; i++) { c.beginPath(); c.arc(Math.random() * L.w, Math.random() * L.h, 10 + Math.random() * 30, 0, 7); c.fill(); }
      // decoración lejos de la pista
      const deco = ['🌳', '🌲', '🌷', '🌼', '🏠', '🐄', '🌻', '🐑'];
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#000';
      for (let k = 0, puestas = 0; k < 300 && puestas < 16; k++) {
        const x = 30 + Math.random() * (L.w - 60), y = 90 + Math.random() * (L.h - 120);
        if (x > L.w - 150 && y > L.h - 150) continue;   // lugar del pedal
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
      // cordón rojo y blanco
      camino(); c.lineWidth = ancho + 16; c.strokeStyle = '#fff'; c.stroke();
      c.setLineDash([18, 18]); camino(); c.strokeStyle = '#ef4444'; c.stroke();
      // asfalto
      c.setLineDash([]); camino(); c.lineWidth = ancho; c.strokeStyle = '#4b5563'; c.stroke();
      // línea del medio
      c.setLineDash([22, 18]); camino(); c.lineWidth = 4; c.strokeStyle = '#fde047'; c.stroke();
      c.setLineDash([]);
      // largada a cuadros
      const p0 = pts[0], p1 = pts[1];
      const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      c.save(); c.translate(p0.x, p0.y); c.rotate(ang);
      const filas = 6, lado = ancho / filas;
      for (let i = 0; i < filas; i++) for (let j = 0; j < 2; j++) {
        c.fillStyle = (i + j) % 2 ? '#111' : '#fff';
        c.fillRect(j * lado - lado, -ancho / 2 + i * lado, lado, lado);
      }
      c.restore();
      c.font = api.fuenteEmoji(34);
      c.fillText('🏁', p0.x + ancho * 0.9, p0.y);
    }

    // ---------- Estado ----------
    let s = 0, v = 0, vueltas = 0, estrellas = [], motor = null;
    const apretados = new Set();
    const vmax = () => total / 5.5;  // una vuelta en ~5,5 segundos

    function ponerEstrellas() {
      estrellas = [];
      for (let i = 0; i < 4; i++) estrellas.push({ s: total * (0.15 + i * 0.2 + Math.random() * 0.08), tomada: false });
    }

    const L = api.lienzo(area, armar);

    // ---------- Controles ----------
    function apretar(e) {
      if (e.target.closest('.bocina, .elegir-auto')) return;
      apretados.add(e.pointerId);
      pedal.classList.add('apretado');
      if (!motor) { motor = api.sonido.motor(); api.alSalir(() => motor.parar()); }
    }
    function soltar(e) {
      apretados.delete(e.pointerId);
      if (!apretados.size) pedal.classList.remove('apretado');
    }
    area.addEventListener('pointerdown', apretar);
    area.addEventListener('pointerup', soltar);
    area.addEventListener('pointercancel', soltar);
    area.addEventListener('pointerleave', soltar);
    area.querySelector('.bocina').addEventListener('pointerdown', () => api.sonido.bocina());

    // ---------- Bucle ----------
    api.cuadro((dt, t) => {
      const vm = vmax();
      if (apretados.size) v = Math.min(vm, v + vm * 0.9 * dt);
      else v = Math.max(0, v - vm * 0.6 * dt);
      s += v * dt;
      if (motor) motor.set(v / vm);

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
        const d = ((e.s - s) % total + total) % total;
        if (d < 18 || d > total - 6) {
          e.tomada = true;
          api.sonido.pop();
          const p = enPista(e.s), r = L.cv.getBoundingClientRect();
          api.chispa(r.left + p.x, r.top + p.y, '#facc15');
        }
      }

      const cx = L.cx;
      if (fondo) cx.drawImage(fondo, 0, 0, L.w, L.h);
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = '#000';
      cx.font = api.fuenteEmoji(ancho * 0.55);
      for (const e of estrellas) {
        if (e.tomada) continue;
        const p = enPista(e.s);
        cx.save(); cx.translate(p.x, p.y); cx.scale(1 + Math.sin(t / 200) * 0.12, 1 + Math.sin(t / 200) * 0.12);
        cx.fillText('⭐', 0, 0); cx.restore();
      }
      // auto
      const p = enPista(s), tam = ancho * 1.1;
      cx.fillStyle = 'rgba(0,0,0,.25)';
      cx.beginPath(); cx.ellipse(p.x, p.y + tam * 0.3, tam * 0.45, tam * 0.15, 0, 0, 7); cx.fill();
      cx.save();
      cx.translate(p.x, p.y - (v > 0 ? Math.abs(Math.sin(t / 60)) * 2 : 0));
      cx.rotate(p.ang);
      if (Math.cos(p.ang) < 0) cx.scale(1, -1);
      cx.scale(-1, 1);   // los emojis de autos miran a la izquierda: los damos vuelta
      cx.fillStyle = '#000';
      cx.font = api.fuenteEmoji(tam);
      cx.fillText(auto, 0, 0);
      cx.restore();
      // humito cuando acelera
      if (apretados.size && v > 10) {
        cx.fillStyle = '#000'; cx.globalAlpha = 0.5; cx.font = api.fuenteEmoji(tam * 0.35);
        cx.fillText('💨', p.x - Math.cos(p.ang) * tam * 0.6, p.y - Math.sin(p.ang) * tam * 0.6);
        cx.globalAlpha = 1;
      }
    });

    api.decir('¡Mantené apretado el botón verde para acelerar!');
  }
});
