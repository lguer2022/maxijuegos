// 13. Burbujas: tirar burbujas y juntar 3 o más del mismo color (tipo Bubble Shooter, sin perder)
App.registrar({
  id: 'burbujas', nombre: 'Burbujas', emoji: '🔵', color: '#3b82f6',
  fondo: 'linear-gradient(#1e3a8a, #2563eb 55%, #93c5fd)',
  iniciar(area, api) {
    area.innerHTML = '<div class="marcador">💥 <span>0</span></div>';
    const span = area.querySelector('.marcador span');
    const PALETA = [
      ['#ef4444', '#fecaca'], ['#facc15', '#fef9c3'], ['#3b82f6', '#bfdbfe'],
      ['#22c55e', '#bbf7d0'], ['#a855f7', '#e9d5ff']
    ];
    const grid = new Map();
    const k = (r, c) => r + ',' + c;
    let cols = 8, R = 20, ox = 0, top = 60, tirador = { x: 0, y: 0 };
    let nivel = 0, nColores = 3, puntos = 0;
    let actual = 0, siguiente = 0, bala = null, apunta = null;
    let efectos = [], caen = [];

    function recalcular(L) {
      cols = L.w < 520 ? 7 : (L.w < 900 ? 9 : 11);
      R = Math.min(L.w / (2 * cols + 1), L.h / 20);
      ox = (L.w - (2 * cols + 1) * R) / 2;
      top = 60;
      tirador = { x: L.w / 2, y: L.h - R * 2.2 };
    }
    const L = api.lienzo(area, recalcular);

    const maxC = r => cols - 1 - (r % 2 ? 1 : 0);
    const pos = (r, c) => ({ x: ox + R + c * 2 * R + (r % 2 ? R : 0), y: top + R + r * R * 1.74 });
    function vecinos(r, c) {
      const d = r % 2
        ? [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]]
        : [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]];
      return d.map(([a, b]) => [r + a, c + b]).filter(([a, b]) => a >= 0 && b >= 0 && b <= maxC(a));
    }
    function presentes() {
      const s = new Set(grid.values());
      return s.size ? [...s] : Array.from({ length: nColores }, (_, i) => i);
    }
    const colorAzar = () => api.azar(presentes());

    function nuevoNivel() {
      grid.clear();
      const filas = [4, 5, 6][Math.min(nivel, 2)];
      nColores = nivel < 1 ? 3 : (nivel < 3 ? 4 : 5);
      for (let r = 0; r < filas; r++) for (let c = 0; c <= maxC(r); c++) grid.set(k(r, c), (Math.random() * nColores) | 0);
      actual = colorAzar(); siguiente = colorAzar();
      api.decir(nivel === 0 ? '¡Tocá arriba para tirar burbujas! Juntá tres del mismo color.' : '¡Más burbujas!');
    }

    // ---------- Controles ----------
    const local = e => { const r = L.cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const posSiguiente = () => ({ x: tirador.x + R * 3, y: tirador.y + R * 0.4 });
    area.addEventListener('pointerdown', e => {
      const p = local(e), ps = posSiguiente();
      if (Math.hypot(p.x - ps.x, p.y - ps.y) < R * 1.6 || Math.hypot(p.x - tirador.x, p.y - tirador.y) < R * 1.4) {
        [actual, siguiente] = [siguiente, actual]; api.sonido.voltear(); return;
      }
      apunta = p;
    });
    area.addEventListener('pointermove', e => { if (apunta) apunta = local(e); });
    area.addEventListener('pointerup', () => { if (apunta) { disparar(apunta); apunta = null; } });
    area.addEventListener('pointercancel', () => { apunta = null; });

    function angulo(p) {
      let a = Math.atan2(p.y - tirador.y, p.x - tirador.x);
      if (a > 0) a = p.x < tirador.x ? -Math.PI + 0.15 : -0.15;
      return Math.max(-Math.PI + 0.15, Math.min(-0.15, a));
    }
    function disparar(p) {
      if (bala) return;
      const a = angulo(p), v = Math.max(700, L.h * 1.6);
      bala = { x: tirador.x, y: tirador.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: actual };
      actual = siguiente; siguiente = colorAzar();
      api.sonido.disparo();
    }

    // ---------- Lógica ----------
    function pegar(b) {
      let r = Math.max(0, Math.round((b.y - top - R) / (R * 1.74)));
      let c = Math.round((b.x - ox - R - (r % 2 ? R : 0)) / (2 * R));
      c = Math.max(0, Math.min(maxC(r), c));
      if (grid.has(k(r, c))) {
        // buscar el lugar libre más cercano
        let mejor = null, dmin = 1e9;
        const cand = [[r, c], ...vecinos(r, c), ...vecinos(r, c).flatMap(([a, bb]) => vecinos(a, bb))];
        for (const [a, bb] of cand) {
          if (grid.has(k(a, bb))) continue;
          const q = pos(a, bb), d = Math.hypot(q.x - b.x, q.y - b.y);
          if (d < dmin) { dmin = d; mejor = [a, bb]; }
        }
        if (!mejor) return;
        [r, c] = mejor;
      }
      grid.set(k(r, c), b.c);
      api.sonido.pegar();

      // grupo del mismo color
      const grupo = [], visto = new Set([k(r, c)]), cola = [[r, c]];
      while (cola.length) {
        const [a, bb] = cola.pop(); grupo.push([a, bb]);
        for (const [x, y] of vecinos(a, bb)) {
          const kk = k(x, y);
          if (!visto.has(kk) && grid.get(kk) === b.c) { visto.add(kk); cola.push([x, y]); }
        }
      }
      if (grupo.length >= 3) {
        grupo.forEach(([a, bb], i) => {
          const q = pos(a, bb);
          grid.delete(k(a, bb));
          efectos.push({ x: q.x, y: q.y, c: b.c, t: 0 });
          if (i < 6) api.despues(i * 60, () => api.sonido.pop());
        });
        const rr = L.cv.getBoundingClientRect(), q = pos(r, c);
        api.chispa(rr.left + q.x, rr.top + q.y, PALETA[b.c][0]);
        puntos += grupo.length;
        // las que quedaron colgando se caen
        const unidas = new Set(), cola2 = [];
        for (const kk of grid.keys()) if (kk.startsWith('0,')) { unidas.add(kk); cola2.push(kk.split(',').map(Number)); }
        while (cola2.length) {
          const [a, bb] = cola2.pop();
          for (const [x, y] of vecinos(a, bb)) { const kk = k(x, y); if (grid.has(kk) && !unidas.has(kk)) { unidas.add(kk); cola2.push([x, y]); } }
        }
        for (const [kk, col] of [...grid]) {
          if (unidas.has(kk)) continue;
          const [a, bb] = kk.split(',').map(Number), q2 = pos(a, bb);
          grid.delete(kk); caen.push({ x: q2.x, y: q2.y, vy: 0, c: col }); puntos++;
        }
        span.textContent = puntos;
        if (!presentes().includes(actual) && grid.size) actual = colorAzar();
        if (!presentes().includes(siguiente) && grid.size) siguiente = colorAzar();
        if (grid.size === 0) {
          api.despues(500, () => api.festejo('¡Explotaste todas las burbujas!'));
          nivel++;
          api.despues(3000, nuevoNivel);
        } else if (grupo.length >= 5) api.decir('¡Guau!');
      } else {
        // si las burbujas llegan muy abajo, se desinflan solas (acá no se pierde)
        const q = pos(r, c);
        if (q.y > tirador.y - R * 4) { grid.delete(k(r, c)); efectos.push({ x: q.x, y: q.y, c: b.c, t: 0 }); }
      }
    }

    function moverBala(dt) {
      const pasos = Math.ceil(Math.hypot(bala.vx, bala.vy) * dt / (R * 0.4));
      for (let i = 0; i < pasos && bala; i++) {
        bala.x += bala.vx * dt / pasos; bala.y += bala.vy * dt / pasos;
        if (bala.x < ox + R) { bala.x = ox + R; bala.vx = Math.abs(bala.vx); api.sonido.tono({ f: 500, dur: 0.05, vol: 0.06 }); }
        if (bala.x > L.w - ox - R) { bala.x = L.w - ox - R; bala.vx = -Math.abs(bala.vx); api.sonido.tono({ f: 500, dur: 0.05, vol: 0.06 }); }
        let toca = bala.y < top + R;
        if (!toca) for (const kk of grid.keys()) {
          const [a, bb] = kk.split(',').map(Number), q = pos(a, bb);
          if (Math.hypot(q.x - bala.x, q.y - bala.y) < R * 1.75) { toca = true; break; }
        }
        if (toca) { const b = bala; bala = null; pegar(b); }
      }
    }

    // ---------- Dibujo ----------
    function burbuja(cx, x, y, r, c, alfa) {
      const [fuerte, claro] = PALETA[c];
      cx.globalAlpha = alfa == null ? 1 : alfa;
      const g = cx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
      g.addColorStop(0, claro); g.addColorStop(0.55, fuerte); g.addColorStop(1, fuerte);
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, r * 0.95, 0, 7); cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.75)';
      cx.beginPath(); cx.ellipse(x - r * 0.35, y - r * 0.4, r * 0.22, r * 0.14, -0.6, 0, 7); cx.fill();
      cx.globalAlpha = 1;
    }

    function guia(cx) {
      const a = angulo(apunta);
      let x = tirador.x, y = tirador.y, vx = Math.cos(a), vy = Math.sin(a);
      cx.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 70; i++) {
        x += vx * R * 0.7; y += vy * R * 0.7;
        if (x < ox + R) { x = ox + R; vx = -vx; }
        if (x > L.w - ox - R) { x = L.w - ox - R; vx = -vx; }
        if (y < top + R) break;
        let toca = false;
        for (const kk of grid.keys()) { const [r, c] = kk.split(',').map(Number), q = pos(r, c); if (Math.hypot(q.x - x, q.y - y) < R * 1.6) { toca = true; break; } }
        if (toca) break;
        if (i % 2 === 0) { cx.beginPath(); cx.arc(x, y, R * 0.14, 0, 7); cx.fill(); }
      }
    }

    api.cuadro((dt, t) => {
      const cx = L.cx;
      if (bala) moverBala(dt);
      cx.clearRect(0, 0, L.w, L.h);
      // techo
      cx.fillStyle = 'rgba(255,255,255,.18)'; cx.fillRect(ox, 0, L.w - 2 * ox, top);
      for (const [kk, c] of grid) { const [r, cc] = kk.split(',').map(Number), q = pos(r, cc); burbuja(cx, q.x, q.y + Math.sin(t / 500 + cc) * 1.2, R, c); }
      // efectos de explosión
      efectos = efectos.filter(e => (e.t += dt) < 0.3);
      for (const e of efectos) burbuja(cx, e.x, e.y, R * (1 + e.t * 3), e.c, 1 - e.t / 0.3);
      caen = caen.filter(b => b.y < L.h + R * 2);
      for (const b of caen) { b.vy += 2200 * dt; b.y += b.vy * dt; burbuja(cx, b.x, b.y, R, b.c); }
      if (apunta && !bala) guia(cx);
      if (bala) burbuja(cx, bala.x, bala.y, R, bala.c);
      // tirador
      cx.fillStyle = 'rgba(255,255,255,.3)';
      cx.beginPath(); cx.arc(tirador.x, tirador.y, R * 1.45, 0, 7); cx.fill();
      if (!bala) burbuja(cx, tirador.x, tirador.y, R, actual);
      const ps = posSiguiente();
      burbuja(cx, ps.x, ps.y, R * 0.7, siguiente);
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = '#000';
      cx.font = api.fuenteEmoji(R * 1.6);
      cx.fillText('🐙', tirador.x - R * 3.2, tirador.y + R * 0.2);
    });

    nuevoNivel();
  }
});
