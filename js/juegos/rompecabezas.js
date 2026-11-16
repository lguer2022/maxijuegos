// 22. Rompecabezas: arrastrar las piezas a su lugar (4, después 6, después 9 piezas)
App.registrar({
  id: 'rompecabezas', nombre: 'Rompecabezas', emoji: '🧩', color: '#65a30d',
  fondo: 'linear-gradient(#ecfccb, #e0f2fe)',
  iniciar(area, api) {
    const dibujos = [
      { e: '🦁', n: 'el león', c: ['#fde68a', '#f59e0b'] },
      { e: '🚒', n: 'el camión de bomberos', c: ['#bfdbfe', '#60a5fa'] },
      { e: '🦄', n: 'el unicornio', c: ['#fbcfe8', '#c084fc'] },
      { e: '🐢', n: 'la tortuga', c: ['#bbf7d0', '#22c55e'] },
      { e: '🚀', n: 'el cohete', c: ['#1e3a8a', '#7c3aed'] },
      { e: '🐳', n: 'la ballena', c: ['#a5f3fc', '#0284c7'] },
      { e: '🦖', n: 'el dinosaurio', c: ['#fef08a', '#84cc16'] },
      { e: '🐙', n: 'el pulpo', c: ['#fecdd3', '#fb7185'] },
      { e: '🏰', n: 'el castillo', c: ['#e0e7ff', '#818cf8'] }
    ];
    const niveles = [[2, 2], [3, 2], [3, 3]];
    let nivel = 0, dibujo = null, piezas = [], tablero = null, imagen = '', B = 300, bx = 0, by = 0, bandeja = null, z = 10;

    function pintar(d) {
      const S = 600, c = document.createElement('canvas');
      c.width = c.height = S;
      const x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, 0, S);
      g.addColorStop(0, d.c[0]); g.addColorStop(1, d.c[1]);
      x.fillStyle = g; x.fillRect(0, 0, S, S);
      x.fillStyle = 'rgba(255,255,255,.35)';
      for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(Math.random() * S, Math.random() * S, 20 + Math.random() * 50, 0, 7); x.fill(); }
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = '#000';
      x.font = api.fuenteEmoji(S * 0.72);
      x.fillText(d.e, S / 2, S * 0.54);
      return c.toDataURL('image/png');
    }

    function nuevo() {
      dibujo = api.azar(dibujos.filter(d => d !== dibujo));
      imagen = pintar(dibujo);
      const [cols, filas] = niveles[Math.min(nivel, niveles.length - 1)];
      area.innerHTML = '<div class="tablero"></div>';
      tablero = area.querySelector('.tablero');
      piezas = [];
      for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++) {
        const el = document.createElement('div');
        el.className = 'pieza';
        el.style.backgroundImage = `url(${imagen})`;
        const p = { el, f, c, cols, filas, puesta: false };
        arrastrable(p);
        area.appendChild(el);
        piezas.push(p);
      }
      api.mezclar(piezas).forEach((p, i) => { p.orden = i; });
      acomodar();
      api.decir(`¡Armá ${dibujo.n}! Llevá cada pieza a su lugar.`);
    }

    // Ubica tablero, huecos y piezas según el tamaño de la pantalla
    function acomodar() {
      if (!tablero) return;
      const W = area.clientWidth, H = area.clientHeight;
      if (!W || !H) return;
      const ancho = W >= H;
      B = ancho ? Math.min(H - 40, W * 0.52) : Math.min(W - 40, H * 0.52);
      bx = ancho ? 20 : (W - B) / 2;
      by = ancho ? (H - B) / 2 : 20;
      bandeja = ancho ? { x: B + 50, y: 20, w: W - B - 70, h: H - 40 } : { x: 20, y: B + 40, w: W - 40, h: H - B - 60 };
      Object.assign(tablero.style, { left: bx + 'px', top: by + 'px', width: B + 'px', height: B + 'px', backgroundImage: `url(${imagen})` });
      tablero.innerHTML = '';
      const [cols, filas] = [piezas[0].cols, piezas[0].filas];
      const pw = B / cols, ph = B / filas;
      tablero.style.setProperty('--cols', cols); tablero.style.setProperty('--filas', filas);
      for (let i = 0; i < cols * filas; i++) tablero.insertAdjacentHTML('beforeend', '<div class="hueco-pieza"></div>');
      // las piezas sueltas se acomodan en filas en la bandeja, sin taparse (o tapándose poquito)
      const n = piezas.length;
      const tc = Math.max(1, Math.min(n, Math.floor((bandeja.w + pw * 0.15) / (pw * 1.05)) || 1));
      const tr = Math.ceil(n / tc);
      const pasoX = tc > 1 ? Math.min(pw * 1.08, (bandeja.w - pw) / (tc - 1)) : 0;
      const pasoY = tr > 1 ? Math.min(ph * 1.08, Math.max(ph * 0.35, (bandeja.h - ph) / (tr - 1))) : 0;
      const x0 = bandeja.x + (bandeja.w - (pw + pasoX * (tc - 1))) / 2;
      const y0 = bandeja.y + Math.max(0, (bandeja.h - (ph + pasoY * (tr - 1))) / 2);
      for (const p of piezas) {
        p.tx = x0 + (p.orden % tc) * pasoX;
        p.ty = y0 + Math.floor(p.orden / tc) * pasoY;
        Object.assign(p.el.style, {
          width: pw + 'px', height: ph + 'px',
          backgroundSize: `${B}px ${B}px`, backgroundPosition: `${-p.c * pw}px ${-p.f * ph}px`
        });
        if (p.puesta) ponerEn(p, bx + p.c * pw, by + p.f * ph);
        else ponerEn(p, p.tx, p.ty);
      }
    }
    function ponerEn(p, x, y) { p.x = x; p.y = y; p.el.style.left = x + 'px'; p.el.style.top = y + 'px'; }

    const ro = new ResizeObserver(() => acomodar());
    ro.observe(area);
    api.alSalir(() => ro.disconnect());

    function arrastrable(p) {
      p.el.addEventListener('pointerdown', e => {
        if (p.puesta) return;
        e.preventDefault();
        try { p.el.setPointerCapture(e.pointerId); } catch (_) {}
        const x0 = e.clientX, y0 = e.clientY, px = p.x, py = p.y;
        let movio = false;
        p.el.style.zIndex = ++z;
        p.el.classList.add('arrastrando');
        api.sonido.click();
        const mover = ev => {
          const dx = ev.clientX - x0, dy = ev.clientY - y0;
          if (Math.hypot(dx, dy) > 8) movio = true;
          const W = area.clientWidth, H = area.clientHeight, pw = p.el.offsetWidth, ph = p.el.offsetHeight;
          ponerEn(p, Math.max(-pw / 3, Math.min(W - pw * 2 / 3, px + dx)), Math.max(-ph / 3, Math.min(H - ph * 2 / 3, py + dy)));
        };
        const soltar = () => {
          p.el.removeEventListener('pointermove', mover);
          p.el.removeEventListener('pointerup', soltar);
          p.el.removeEventListener('pointercancel', soltar);
          p.el.classList.remove('arrastrando');
          const pw = B / p.cols, ph = B / p.filas;
          const ox = bx + p.c * pw, oy = by + p.f * ph;
          if (Math.hypot(p.x - ox, p.y - oy) < Math.min(pw, ph) * 0.45) colocar(p, ox, oy);
          else if (!movio) pista(p);
          else if (p.x + pw / 2 > bx && p.x + pw / 2 < bx + B && p.y + ph / 2 > by && p.y + ph / 2 < by + B) {
            api.sonido.boing();   // la soltó en el tablero pero no en su lugar
          }
        };
        p.el.addEventListener('pointermove', mover);
        p.el.addEventListener('pointerup', soltar);
        p.el.addEventListener('pointercancel', soltar);
      });
    }

    // Si toca una pieza sin moverla, se ilumina el lugar donde va
    function pista(p) {
      const h = tablero.children[p.f * p.cols + p.c];
      if (!h) return;
      h.classList.remove('pista'); void h.offsetWidth; h.classList.add('pista');
      api.decir('¡Llevala hasta el lugar que brilla!');
    }

    function colocar(p, x, y) {
      p.puesta = true;
      p.el.classList.add('puesta');
      p.el.style.zIndex = 2;
      ponerEn(p, x, y);
      api.sonido.pop();
      api.chispa(...api.centro(p.el));
      if (piezas.every(q => q.puesta)) {
        piezas.forEach(q => q.el.classList.add('completa'));
        api.despues(300, () => api.festejo(`¡Armaste ${dibujo.n}!`));
        nivel++;
        api.despues(3800, nuevo);
      } else api.sonido.bien();
    }

    nuevo();
  }
});
