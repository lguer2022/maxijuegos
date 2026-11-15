// 10. Pintar: dibujo libre con colores, pincel arcoíris y sellos
App.registrar({
  id: 'pintar', nombre: 'Pintar', emoji: '🖍️', color: '#ec4899',
  fondo: 'linear-gradient(#fce7f3, #e0e7ff)',
  iniciar(area, api) {
    const colores = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#111827'];
    const sellos = ['⭐', '❤️', '🌸', '🐶', '🦋', '🚗'];
    area.innerHTML = `
      <div class="lienzo-caja"><canvas class="lienzo"></canvas></div>
      <div class="paleta"></div>`;
    const caja = area.querySelector('.lienzo-caja');
    const cv = area.querySelector('.lienzo');
    const cx = cv.getContext('2d');
    const paleta = area.querySelector('.paleta');
    let herramienta = { tipo: 'color', valor: colores[4] };
    let hue = 0, ultimoBrillo = 0;
    const trazos = new Map();

    function boton(html, fn, clase) {
      const b = document.createElement('button');
      b.className = 'herr ' + (clase || '');
      b.innerHTML = html;
      b.addEventListener('click', () => {
        api.sonido.click();
        paleta.querySelectorAll('.herr').forEach(x => x.classList.remove('elegida'));
        if (!b.classList.contains('accion')) b.classList.add('elegida');
        fn(b);
      });
      paleta.appendChild(b);
      return b;
    }
    colores.forEach((c, i) => {
      const b = boton(`<span class="gota" style="background:${c}"></span>`, () => { herramienta = { tipo: 'color', valor: c }; });
      if (i === 4) b.classList.add('elegida');
    });
    boton('🌈', () => { herramienta = { tipo: 'arcoiris' }; });
    sellos.forEach(s => boton(s, () => { herramienta = { tipo: 'sello', valor: s }; }));
    boton('🧽', limpiar, 'accion');

    function ajustar() {
      const d = window.devicePixelRatio || 1;
      const w = caja.clientWidth, h = caja.clientHeight;
      if (!w || !h) return;
      const copia = document.createElement('canvas');
      copia.width = cv.width; copia.height = cv.height;
      if (cv.width) copia.getContext('2d').drawImage(cv, 0, 0);
      cv.width = w * d; cv.height = h * d;
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      cx.setTransform(d, 0, 0, d, 0, 0);
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h);
      if (copia.width) cx.drawImage(copia, 0, 0, copia.width / d, copia.height / d);
      cx.lineCap = 'round'; cx.lineJoin = 'round';
    }
    const ro = new ResizeObserver(ajustar);
    ro.observe(caja);
    this._ro = ro;

    function punto(e) {
      const r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    cv.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      const p = punto(e);
      if (herramienta.tipo === 'sello') {
        const tam = 50 + Math.random() * 30;
        cx.save();
        cx.translate(p.x, p.y);
        cx.rotate((Math.random() - 0.5) * 0.6);
        cx.font = `${tam}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText(herramienta.valor, 0, 0);
        cx.restore();
        api.sonido.pop();
        api.chispa(e.clientX, e.clientY);
        return;
      }
      trazos.set(e.pointerId, p);
      dibujar(p, p);
    });
    cv.addEventListener('pointermove', e => {
      const ant = trazos.get(e.pointerId);
      if (!ant) return;
      const p = punto(e);
      dibujar(ant, p);
      trazos.set(e.pointerId, p);
      const ahora = performance.now();
      if (ahora - ultimoBrillo > 140) { api.sonido.brillo(); ultimoBrillo = ahora; }
    });
    const fin = e => trazos.delete(e.pointerId);
    cv.addEventListener('pointerup', fin);
    cv.addEventListener('pointercancel', fin);

    function dibujar(a, b) {
      if (herramienta.tipo === 'arcoiris') { hue = (hue + 4) % 360; cx.strokeStyle = `hsl(${hue},95%,55%)`; }
      else cx.strokeStyle = herramienta.valor;
      cx.lineWidth = 18;
      cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x + 0.01, b.y); cx.stroke();
    }

    function limpiar() {
      api.sonido.whoosh();
      caja.classList.add('borrando');
      api.despues(350, () => {
        cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
        caja.classList.remove('borrando');
      });
    }

    api.decir('¡A pintar! Elegí un color y dibujá con el dedo.');
  },
  detener() { if (this._ro) { this._ro.disconnect(); this._ro = null; } }
});
