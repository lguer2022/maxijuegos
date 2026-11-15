// 7. Contar: ¿cuántos hay? (del 1 al 3 al principio, después hasta 5)
App.registrar({
  id: 'contar', nombre: 'Contar', emoji: '🔢', color: '#eab308',
  fondo: 'linear-gradient(#fef9c3, #dcfce7)',
  iniciar(area, api) {
    const cosas = [
      { e: '🍎', s: 'manzana', p: 'manzanas', f: true },
      { e: '🐟', s: 'pescadito', p: 'pescaditos', f: false },
      { e: '⭐', s: 'estrella', p: 'estrellas', f: true },
      { e: '🎈', s: 'globo', p: 'globos', f: false },
      { e: '🐞', s: 'vaquita', p: 'vaquitas', f: true },
      { e: '🍓', s: 'frutilla', p: 'frutillas', f: true },
      { e: '🚗', s: 'autito', p: 'autitos', f: false },
      { e: '🐥', s: 'pollito', p: 'pollitos', f: false }
    ];
    const palabra = (n, fem) => n === 1 ? (fem ? 'una' : 'uno') : ['', '', 'dos', 'tres', 'cuatro', 'cinco'][n];
    const puntos = n => '<span class="puntos">' + '●'.repeat(n) + '</span>';

    area.innerHTML = `
      <div class="pregunta"><button class="btn-repetir">🔊</button><span></span></div>
      <div class="campo"></div>
      <div class="numeros"></div>`;
    const preg = area.querySelector('.pregunta span');
    const campo = area.querySelector('.campo');
    const nums = area.querySelector('.numeros');
    let aciertos = 0, n = 0, obj = null, bloqueado = false, contados = 0, items = [];

    const decirPregunta = () => api.decir(`¿Cuánt${obj.f ? 'as' : 'os'} ${obj.p} hay?`);
    area.querySelector('.btn-repetir').addEventListener('click', decirPregunta);

    for (let i = 1; i <= 5; i++) {
      const b = document.createElement('button');
      b.className = 'numero';
      b.innerHTML = `<span class="cifra">${i}</span>${puntos(i)}`;
      b.addEventListener('pointerdown', () => elegir(i, b));
      nums.appendChild(b);
    }

    function ronda() {
      const max = aciertos < 5 ? 3 : 5;
      let nuevo;
      do { nuevo = api.entero(1, max); } while (nuevo === n && max > 1);
      n = nuevo;
      obj = api.azar(cosas);
      contados = 0;
      preg.textContent = `¿Cuánt${obj.f ? 'as' : 'os'} ${obj.p} hay?`;
      campo.innerHTML = '';
      // Ubicar los objetos en celdas de una grilla de 3x2, con un poco de desorden
      const celdas = api.mezclar([0, 1, 2, 3, 4, 5]).slice(0, n);
      items = celdas.map((cel, k) => {
        const d = document.createElement('div');
        d.className = 'cosa';
        d.textContent = obj.e;
        const col = cel % 3, fil = Math.floor(cel / 3);
        d.style.left = (col * 33.3 + 16.6 + (Math.random() - 0.5) * 12) + '%';
        d.style.top = (fil * 50 + 25 + (Math.random() - 0.5) * 16) + '%';
        d.style.animationDelay = (k * 0.1) + 's';
        d.addEventListener('pointerdown', () => marcar(d));
        campo.appendChild(d);
        return d;
      });
      nums.querySelectorAll('.numero').forEach(b => {
        b.classList.remove('correcta', 'mal');
        b.style.display = (+b.textContent[0] <= max) ? '' : 'none';
      });
      bloqueado = false;
      decirPregunta();
    }

    function marcar(d) {
      if (d.dataset.num) return;
      contados++;
      d.dataset.num = contados;
      d.insertAdjacentHTML('beforeend', `<b class="etiqueta">${contados}</b>`);
      d.classList.add('contada');
      api.sonido.contar(contados);
      api.decir(palabra(contados, obj.f));
    }

    function contarJuntos() {
      items.forEach(d => { d.dataset.num = ''; d.classList.remove('contada'); const e = d.querySelector('.etiqueta'); if (e) e.remove(); });
      contados = 0;
      items.forEach((d, k) => api.despues(900 + k * 800, () => marcar(d)));
    }

    function elegir(i, b) {
      if (bloqueado) return;
      if (i === n) {
        bloqueado = true;
        b.classList.add('correcta');
        api.sonido.bien();
        api.estrella(b);
        aciertos++;
        if (aciertos % 5 === 0) { api.despues(400, () => api.festejo()); api.despues(2800, ronda); }
        else {
          api.decir(n === 1 ? `¡Sí! Hay ${obj.f ? 'una' : 'un'} ${obj.s}` : `¡Sí! Hay ${palabra(n)} ${obj.p}`);
          api.despues(2200, ronda);
        }
      } else {
        b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
        api.sonido.boing();
        api.decir('¡Contemos juntos!');
        contarJuntos();
      }
    }

    ronda();
  }
});
