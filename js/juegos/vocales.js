// 14. Vocales: ¿con qué letra empieza? (A E I O U)
App.registrar({
  id: 'vocales', nombre: 'Vocales', emoji: '🔤', color: '#f43f5e',
  fondo: 'linear-gradient(#ffe4e6, #fef3c7)',
  iniciar(area, api) {
    const palabras = [
      { v: 'A', e: '🐝', p: 'abeja' }, { v: 'A', e: '🌳', p: 'árbol' }, { v: 'A', e: '✈️', p: 'avión' },
      { v: 'A', e: '🕷️', p: 'araña' }, { v: 'A', e: '💍', p: 'anillo' },
      { v: 'E', e: '🐘', p: 'elefante' }, { v: 'E', e: '⭐', p: 'estrella' }, { v: 'E', e: '🦔', p: 'erizo' },
      { v: 'E', e: '🧹', p: 'escoba' },
      { v: 'I', e: '🦎', p: 'iguana' }, { v: 'I', e: '🏝️', p: 'isla' }, { v: 'I', e: '🧲', p: 'imán' },
      { v: 'I', e: '⛪', p: 'iglesia' },
      { v: 'O', e: '🐻', p: 'oso' }, { v: 'O', e: '👁️', p: 'ojo' }, { v: 'O', e: '🐑', p: 'oveja' },
      { v: 'O', e: '👂', p: 'oreja' }, { v: 'O', e: '🌊', p: 'ola' },
      { v: 'U', e: '🍇', p: 'uva' }, { v: 'U', e: '🦄', p: 'unicornio' }, { v: 'U', e: '1️⃣', p: 'uno' }
    ];
    const colores = { A: '#ef4444', E: '#f97316', I: '#22c55e', O: '#3b82f6', U: '#a855f7' };
    const todas = ['A', 'E', 'I', 'O', 'U'];

    area.innerHTML = `
      <div class="pregunta"><button class="btn-repetir">🔊</button><span>¿Con qué letra empieza?</span></div>
      <div class="dibujo"></div>
      <div class="palabra"></div>
      <div class="opciones"></div>`;
    const dibujo = area.querySelector('.dibujo');
    const palabra = area.querySelector('.palabra');
    const cont = area.querySelector('.opciones');
    let aciertos = 0, actual = null, bloqueado = false;

    const decirPregunta = () => api.decir(`¿Con qué letra empieza ${actual.p}?`);
    area.querySelector('.btn-repetir').addEventListener('click', decirPregunta);

    function ronda() {
      actual = api.azar(palabras.filter(x => x !== actual));
      dibujo.textContent = actual.e;
      dibujo.classList.remove('entra'); void dibujo.offsetWidth; dibujo.classList.add('entra');
      palabra.innerHTML = `<span class="hueco">&nbsp;</span>${actual.p.slice(1).toUpperCase()}`;
      const cant = aciertos < 6 ? 3 : 5;
      const otras = api.mezclar(todas.filter(l => l !== actual.v)).slice(0, cant - 1);
      const opciones = cant === 5 ? todas : api.mezclar([actual.v, ...otras]);
      cont.innerHTML = '';
      opciones.forEach((l, i) => {
        const b = document.createElement('button');
        b.className = 'letra';
        b.style.setProperty('--c', colores[l]);
        b.style.animationDelay = (i * 0.07) + 's';
        b.textContent = l;
        b.addEventListener('pointerdown', () => elegir(l, b));
        cont.appendChild(b);
      });
      bloqueado = false;
      decirPregunta();
    }

    function elegir(l, b) {
      if (bloqueado) return;
      if (l === actual.v) {
        bloqueado = true;
        const h = palabra.querySelector('.hueco');
        h.textContent = actual.p[0].toUpperCase(); h.classList.add('lleno');
        b.classList.add('correcta');
        api.sonido.bien();
        api.estrella(b, colores[l]);
        aciertos++;
        if (aciertos % 5 === 0) { api.despues(600, () => api.festejo()); api.despues(3000, ronda); }
        else { api.decir(`¡Sí! ${l} de ${actual.p}`); api.despues(2300, ronda); }
      } else {
        b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
        api.sonido.boing();
        api.decir(`Esa es la ${l}. ¡Probá otra vez!`);
      }
    }

    ronda();
  }
});
