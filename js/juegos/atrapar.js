// 18. Atrapar: mover la canasta con el dedo para atrapar la fruta que cae (las piedras, mejor esquivarlas)
App.registrar({
  id: 'atrapar', nombre: 'Atrapar', emoji: '🧺', color: '#ea580c',
  fondo: 'linear-gradient(#bae6fd, #fef9c3)',
  iniciar(area, api) {
    area.innerHTML = '<div class="marcador">🍎 <span>0</span></div>';
    const span = area.querySelector('.marcador span');
    let tam = 60, suelo = 0;
    const canasta = { x: 0, destino: 0, sacude: 0, salto: 0 };
    const L = api.lienzo(area, l => {
      tam = Math.max(50, Math.min(l.w, l.h) * 0.13);
      suelo = l.h - tam * 0.75;
      if (!canasta.x) canasta.x = canasta.destino = l.w / 2;
    });
    let cosas = [], proxima = 0.5, puntos = 0, piedras = 0;
    const frutas = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍐', '🍉', '🍒', '🥝'];

    const xLocal = e => e.clientX - L.cv.getBoundingClientRect().left;
    let tocando = false;
    area.addEventListener('pointerdown', e => { tocando = true; canasta.destino = xLocal(e); });
    area.addEventListener('pointermove', e => { if (tocando || e.pointerType === 'mouse') canasta.destino = xLocal(e); });
    const fin = () => { tocando = false; };
    area.addEventListener('pointerup', fin);
    area.addEventListener('pointercancel', fin);

    function nueva() {
      const esPiedra = puntos > 4 && Math.random() < 0.18;
      cosas.push({
        x: tam + Math.random() * (L.w - tam * 2), y: -tam,
        vy: tam * (2.2 + Math.min(puntos, 30) * 0.04 + Math.random() * 0.6),
        e: esPiedra ? '🪨' : api.azar(frutas), piedra: esPiedra, rot: (Math.random() - 0.5) * 2
      });
    }

    api.cuadro((dt, t) => {
      const cx = L.cx;
      proxima -= dt;
      if (proxima <= 0) { nueva(); proxima = Math.max(0.7, 1.4 - puntos * 0.02) * (0.7 + Math.random() * 0.6); }

      // la canasta sigue al dedo, suavecito
      canasta.x += (canasta.destino - canasta.x) * Math.min(1, dt * 12);
      canasta.x = Math.max(tam * 0.6, Math.min(L.w - tam * 0.6, canasta.x));
      canasta.sacude = Math.max(0, canasta.sacude - dt);
      canasta.salto = Math.max(0, canasta.salto - dt);

      for (const c of cosas) {
        c.y += c.vy * dt;
        if (!c.listo && c.y > suelo - tam * 0.45 && c.y < suelo + tam * 0.1 && Math.abs(c.x - canasta.x) < tam * 0.75) {
          c.listo = true;
          if (c.piedra) {
            canasta.sacude = 0.4; piedras++;
            api.sonido.boing();
            if (piedras <= 2) api.decir('¡Uy, una piedra! Esas no.');
          } else {
            canasta.salto = 0.25;
            api.sonido.pop();
            const r = L.cv.getBoundingClientRect();
            api.chispa(r.left + c.x, r.top + suelo - tam * 0.3);
            puntos++; span.textContent = puntos;
            if (puntos % 10 === 0) api.festejo(`¡${puntos} frutas!`);
          }
        }
      }
      cosas = cosas.filter(c => !c.listo && c.y < L.h + tam);

      // dibujo
      cx.clearRect(0, 0, L.w, L.h);
      cx.fillStyle = '#86efac'; cx.fillRect(0, suelo + tam * 0.35, L.w, L.h);
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = '#000';
      cx.font = api.fuenteEmoji(tam * 1.4);
      cx.fillText('🌳', tam * 0.9, tam * 1.3);
      cx.fillText('🌳', L.w - tam * 0.9, tam * 1.5);
      cx.font = api.fuenteEmoji(tam * 0.85);
      for (const c of cosas) {
        cx.save(); cx.translate(c.x, c.y); cx.rotate(Math.sin(t / 300 + c.x) * 0.3 * c.rot);
        cx.fillText(c.e, 0, 0); cx.restore();
      }
      const dx = canasta.sacude > 0 ? Math.sin(t / 25) * 8 : 0;
      const dy = canasta.salto > 0 ? -Math.sin(canasta.salto / 0.25 * Math.PI) * 10 : 0;
      cx.font = api.fuenteEmoji(tam * 1.3);
      cx.fillText('🧺', canasta.x + dx, suelo + dy);
    });

    api.decir('¡Mové la canasta con el dedo y atrapá la fruta!');
  }
});
