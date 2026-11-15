// 12. Dino saltarín: tocar la pantalla para saltar los cactus (sin "perder": si choca, sigue)
App.registrar({
  id: 'dino', nombre: 'Dino saltarín', emoji: '🦖', color: '#84cc16',
  fondo: 'linear-gradient(#7dd3fc, #e0f2fe 70%)',
  iniciar(area, api) {
    area.innerHTML = '<div class="marcador">🌵 <span>0</span></div>';
    const span = area.querySelector('.marcador span');

    let suelo = 0, tam = 60, dinoX = 60;
    function medidas(L) {
      suelo = L.h * 0.8;
      tam = Math.max(48, Math.min(L.h * 0.17, 110));
      dinoX = Math.max(60, L.w * 0.16);
    }
    const L = api.lienzo(area, medidas);

    // Estado
    let y = 0, vy = 0, buffer = 0, golpeado = 0, puntos = 0, recorrido = 0;
    let vel = 0, proximo = 1.2, obstaculos = [], frutas = [], nubes = [];
    for (let i = 0; i < 4; i++) nubes.push({ x: Math.random() * 1400, y: 30 + Math.random() * 120, t: 40 + Math.random() * 40 });

    const gravedad = () => tam * 30;
    const impulso = () => Math.sqrt(2 * gravedad() * tam * 2.3);

    area.addEventListener('pointerdown', () => { buffer = 0.18; });

    function crear() {
      const tipos = ['🌵', '🌵', '🌵', '🪨', '🌵'];
      const e = api.azar(tipos);
      const alto = e === '🪨' ? tam * 0.6 : tam * (0.75 + Math.random() * 0.25);
      obstaculos.push({ x: L.w + 40, e, alto, pasado: false, golpe: false, gy: 0, gvy: 0, rot: 0 });
      if (Math.random() < 0.45) frutas.push({ x: L.w + 40 + tam * 2.5, alto: tam * (1.7 + Math.random() * 0.5), e: api.azar(['🍎', '🍓', '⭐', '🍌', '🍉']), tomada: false });
    }

    function chispaEn(x, yy, color) {
      const r = L.cv.getBoundingClientRect();
      api.chispa(r.left + x, r.top + yy, color);
    }

    api.cuadro((dt, t) => {
      const cx = L.cx, W = L.w;
      vel = tam * Math.min(5, 3.2 + puntos * 0.06);
      recorrido += vel * dt;

      // Salto
      buffer -= dt;
      if (buffer > 0 && y <= 0.5) { vy = impulso(); buffer = 0; api.sonido.salto(); }
      vy -= gravedad() * dt; y += vy * dt;
      if (y < 0) { y = 0; vy = 0; }
      golpeado = Math.max(0, golpeado - dt);

      // Aparecer obstáculos
      proximo -= dt;
      if (proximo <= 0) { crear(); proximo = (1.5 + Math.random() * 1.3) * (tam * 3.2 / vel); }

      // Obstáculos
      for (const o of obstaculos) {
        if (o.golpe) { o.x += vel * 0.6 * dt; o.gvy -= gravedad() * dt; o.gy += o.gvy * dt; o.rot += dt * 8; continue; }
        o.x -= vel * dt;
        const choca = Math.abs(o.x - dinoX) < tam * 0.45 && y < o.alto * 0.8;
        if (choca && golpeado <= 0) {
          o.golpe = true; o.gvy = tam * 9; golpeado = 0.8;
          api.sonido.choque();
          if (Math.random() < 0.5) api.decir('¡Uy! ¡Saltá!');
        } else if (!o.pasado && o.x < dinoX - tam * 0.5) {
          o.pasado = true;
          if (!choca) {
            puntos++; span.textContent = puntos;
            api.sonido.tono({ f: 880, a: 1320, dur: 0.12, tipo: 'triangle', vol: 0.15 });
            if (puntos % 10 === 0) api.festejo(`¡${puntos} cactus saltados!`);
          }
        }
      }
      obstaculos = obstaculos.filter(o => o.x > -80 && o.gy > -L.h);

      // Frutas
      for (const f of frutas) {
        f.x -= vel * dt;
        if (!f.tomada && Math.abs(f.x - dinoX) < tam * 0.6 && Math.abs((y + tam * 0.5) - f.alto) < tam * 0.7) {
          f.tomada = true;
          api.sonido.pop();
          chispaEn(f.x, suelo - f.alto);
          api.estrella(null);
        }
      }
      frutas = frutas.filter(f => f.x > -80 && !f.tomada);

      // ---------- Dibujo ----------
      cx.clearRect(0, 0, W, L.h);
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = '#000';
      cx.font = api.fuenteEmoji(56); cx.fillText('☀️', W - 70, 60);
      cx.globalAlpha = 0.9;
      for (const n of nubes) {
        n.x -= vel * 0.12 * dt;
        if (n.x < -100) { n.x = W + 100 + Math.random() * 200; n.y = 30 + Math.random() * 120; }
        cx.font = api.fuenteEmoji(n.t); cx.fillText('☁️', n.x, n.y);
      }
      cx.globalAlpha = 1;
      // Lomas lejanas
      const lomas = (color, alto, factor, fase) => {
        cx.fillStyle = color; cx.beginPath(); cx.moveTo(0, suelo);
        for (let x = 0; x <= W + 20; x += 20) cx.lineTo(x, suelo - alto - Math.sin((x + recorrido * factor) / 120 + fase) * alto * 0.5);
        cx.lineTo(W, suelo); cx.closePath(); cx.fill();
      };
      lomas('#bef264', tam * 1.6, 0.15, 0);
      lomas('#86efac', tam * 0.9, 0.3, 2);
      // Suelo
      cx.fillStyle = '#f5d48f'; cx.fillRect(0, suelo, W, L.h - suelo);
      cx.fillStyle = '#c99a4b'; cx.fillRect(0, suelo, W, 5);
      cx.fillStyle = 'rgba(150,100,40,.45)';
      for (let i = 0; i < 14; i++) {
        const x = ((i * 97 - recorrido) % (W + 100) + W + 100) % (W + 100) - 50;
        cx.fillRect(x, suelo + 14 + (i % 3) * 14, 18, 4);
      }
      // Frutas
      cx.fillStyle = '#000';
      cx.font = api.fuenteEmoji(tam * 0.6);
      for (const f of frutas) cx.fillText(f.e, f.x, suelo - f.alto + Math.sin(t / 200 + f.x) * 5);
      // Obstáculos
      for (const o of obstaculos) {
        cx.save(); cx.translate(o.x, suelo - o.alto / 2 - o.gy); cx.rotate(o.rot);
        cx.font = api.fuenteEmoji(o.alto); cx.fillText(o.e, 0, 0); cx.restore();
      }
      // Sombra y dino
      const sombra = Math.max(0.3, 1 - y / (tam * 3));
      cx.fillStyle = 'rgba(0,0,0,.2)';
      cx.beginPath(); cx.ellipse(dinoX, suelo + 4, tam * 0.4 * sombra, tam * 0.1 * sombra, 0, 0, 7); cx.fill();
      const bote = y > 0 ? 0 : Math.abs(Math.sin(t / 70)) * tam * 0.06;
      if (golpeado > 0 && Math.floor(golpeado * 12) % 2) cx.globalAlpha = 0.4;
      cx.save();
      cx.translate(dinoX, suelo - y - tam * 0.5 - bote);
      if (y > 0) cx.rotate(vy > 0 ? -0.15 : 0.1);
      cx.scale(-1, 1);   // el emoji del dino mira a la izquierda: lo damos vuelta
      cx.fillStyle = '#000';
      cx.font = api.fuenteEmoji(tam);
      cx.fillText('🦖', 0, 0);
      cx.restore();
      cx.globalAlpha = 1;
    });

    api.decir('¡Tocá la pantalla para que el dino salte los cactus!');
  }
});
