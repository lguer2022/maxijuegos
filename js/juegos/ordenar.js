// 16. Ordenar: llevar cada cosa a su canasta (animales, frutas, vehículos, ropa)
App.registrar({
  id: 'ordenar', nombre: 'Ordenar', emoji: '🧺', color: '#d946ef',
  fondo: 'linear-gradient(#fdf4ff, #fae8ff)',
  iniciar(area, api) {
    const categorias = [
      { id: 'animales', titulo: 'Animales', icono: '🐾', art: 'los animales', c: '#f97316',
        cosas: [['🐶', 'el perro'], ['🐱', 'el gato'], ['🐰', 'el conejo'], ['🐮', 'la vaca'], ['🐷', 'el chancho'], ['🐸', 'la rana'], ['🐵', 'el mono'], ['🦁', 'el león']] },
      { id: 'frutas', titulo: 'Frutas', icono: '🍎', art: 'las frutas', c: '#ef4444',
        cosas: [['🍎', 'la manzana'], ['🍌', 'la banana'], ['🍇', 'las uvas'], ['🍓', 'la frutilla'], ['🍐', 'la pera'], ['🍊', 'la naranja'], ['🍉', 'la sandía'], ['🍒', 'las cerezas']] },
      { id: 'vehiculos', titulo: 'Vehículos', icono: '🚗', art: 'los vehículos', c: '#3b82f6',
        cosas: [['🚗', 'el auto'], ['🚌', 'el colectivo'], ['🚲', 'la bici'], ['✈️', 'el avión'], ['🚂', 'el tren'], ['🚀', 'el cohete'], ['⛵', 'el barco'], ['🚜', 'el tractor']] },
      { id: 'ropa', titulo: 'Ropa', icono: '👕', art: 'la ropa', c: '#22c55e',
        cosas: [['👕', 'la remera'], ['👖', 'el pantalón'], ['🧦', 'las medias'], ['🧢', 'la gorra'], ['👗', 'el vestido'], ['👟', 'la zapatilla'], ['🧤', 'los guantes']] }
    ];
    const may = s => s[0].toUpperCase() + s.slice(1);

    area.innerHTML = `
      <div class="pregunta"><button class="btn-repetir">🔊</button><span></span></div>
      <div class="cosa-ordenar"></div>
      <div class="canastas"></div>`;
    const preg = area.querySelector('.pregunta span');
    const cosaEl = area.querySelector('.cosa-ordenar');
    const canastasEl = area.querySelector('.canastas');
    let rondas = 0, cats = [], cola = [], actual = null, bloqueado = false;
    let dx = 0, dy = 0;

    const decirPregunta = () => api.decir(`¿Dónde va ${actual.nombre}?`);
    area.querySelector('.btn-repetir').addEventListener('click', decirPregunta);

    function nuevaRonda() {
      const cant = rondas < 1 ? 2 : 3;
      cats = api.mezclar(categorias).slice(0, cant);
      cola = api.mezclar(cats.flatMap(cat => api.mezclar(cat.cosas).slice(0, Math.ceil(8 / cant)).map(([e, n]) => ({ e, nombre: n, cat })))).slice(0, 8);
      canastasEl.innerHTML = '';
      cats.forEach(cat => {
        const b = document.createElement('button');
        b.className = 'canasta';
        b.style.setProperty('--c', cat.c);
        b.innerHTML = `<span class="icono">${cat.icono}</span><span>${cat.titulo}</span><span class="dentro"></span>`;
        b.addEventListener('click', () => { if (!arrastrando) probar(cat, b); });
        cat.el = b;
        canastasEl.appendChild(b);
      });
      api.decir(`¡A ordenar! Llevá cada cosa a su canasta.`);
      api.despues(2600, siguiente);
    }

    function siguiente() {
      if (!cola.length) {
        rondas++;
        api.festejo('¡Ordenaste todo!');
        api.despues(3000, nuevaRonda);
        return;
      }
      actual = cola.shift();
      cosaEl.textContent = actual.e;
      cosaEl.style.transition = 'none'; cosaEl.style.transform = ''; cosaEl.style.opacity = '1';
      dx = dy = 0;
      cosaEl.classList.remove('entra'); void cosaEl.offsetWidth; cosaEl.classList.add('entra');
      preg.textContent = `¿Dónde va ${actual.nombre}?`;
      bloqueado = false;
      decirPregunta();
    }

    // Arrastrar
    let arrastrando = false;
    cosaEl.addEventListener('pointerdown', e => {
      if (bloqueado || !actual) return;
      e.preventDefault();
      try { cosaEl.setPointerCapture(e.pointerId); } catch (_) {}
      const x0 = e.clientX, y0 = e.clientY;
      let movio = false;
      cosaEl.classList.add('arrastrando');
      cosaEl.style.transition = 'none';
      const mover = ev => {
        dx = ev.clientX - x0; dy = ev.clientY - y0;
        if (Math.hypot(dx, dy) > 10) { movio = true; arrastrando = true; }
        cosaEl.style.transform = `translate(${dx}px, ${dy}px) scale(1.15)`;
      };
      const soltar = ev => {
        cosaEl.removeEventListener('pointermove', mover);
        cosaEl.removeEventListener('pointerup', soltar);
        cosaEl.removeEventListener('pointercancel', soltar);
        cosaEl.classList.remove('arrastrando');
        setTimeout(() => { arrastrando = false; }, 50);
        if (!movio) { volver(); api.decir(`Llevá ${actual.nombre} a su canasta`); return; }
        const cat = cats.find(c => {
          const r = c.el.getBoundingClientRect();
          return ev.clientX > r.left - 20 && ev.clientX < r.right + 20 && ev.clientY > r.top - 40 && ev.clientY < r.bottom + 20;
        });
        if (cat) probar(cat, cat.el); else volver();
      };
      cosaEl.addEventListener('pointermove', mover);
      cosaEl.addEventListener('pointerup', soltar);
      cosaEl.addEventListener('pointercancel', soltar);
    });

    function volver() {
      cosaEl.style.transition = 'transform .35s cubic-bezier(.3,1.6,.5,1)';
      cosaEl.style.transform = '';
      dx = dy = 0;
    }

    function probar(cat, canasta) {
      if (bloqueado || !actual) return;
      if (cat === actual.cat) {
        bloqueado = true;
        const [bx, by] = api.centro(cosaEl), [cx, cy] = api.centro(canasta);
        cosaEl.style.transition = 'transform .4s ease-in, opacity .4s';
        cosaEl.style.transform = `translate(${dx + cx - bx}px, ${dy + cy - by}px) scale(.3)`;
        cosaEl.style.opacity = '0';
        api.despues(400, () => {
          canasta.querySelector('.dentro').textContent += actual.e;
          canasta.classList.remove('brilla'); void canasta.offsetWidth; canasta.classList.add('brilla');
          api.sonido.bien();
          api.estrella(canasta, cat.c);
          api.decir(api.azar(['¡Muy bien!', '¡Sí!', `¡Va con ${cat.art}!`]));
          api.despues(1500, siguiente);
        });
      } else {
        volver();
        canasta.classList.remove('mal'); void canasta.offsetWidth; canasta.classList.add('mal');
        api.sonido.boing();
        api.decir(`${may(actual.nombre)} va con ${actual.cat.art}. ¡Probá otra vez!`);
      }
    }

    nuevaRonda();
  }
});
