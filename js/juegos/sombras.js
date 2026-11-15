// 8. Sombras: ¿cuál es la sombra del elefante?
App.registrar({
  id: 'sombras', nombre: 'Sombras', emoji: '🦒', color: '#64748b',
  fondo: 'linear-gradient(#fde68a, #fed7aa)',
  iniciar(area, api) {
    const objetos = [
      { e: '🐘', n: 'del elefante' }, { e: '🦒', n: 'de la jirafa' }, { e: '🐢', n: 'de la tortuga' },
      { e: '🦋', n: 'de la mariposa' }, { e: '🚗', n: 'del auto' }, { e: '✈️', n: 'del avión' },
      { e: '🍌', n: 'de la banana' }, { e: '🐌', n: 'del caracol' }, { e: '🐇', n: 'del conejo' },
      { e: '🌵', n: 'del cactus' }, { e: '🦕', n: 'del dinosaurio' }, { e: '🚀', n: 'del cohete' },
      { e: '🐙', n: 'del pulpo' }, { e: '🎸', n: 'de la guitarra' }, { e: '🦀', n: 'del cangrejo' },
      { e: '🐓', n: 'del gallo' }
    ];
    area.innerHTML = `
      <div class="pregunta"><button class="btn-repetir">🔊</button><span>¿Cuál es su sombra?</span></div>
      <div class="modelo"></div>
      <div class="opciones"></div>`;
    const modelo = area.querySelector('.modelo');
    const cont = area.querySelector('.opciones');
    let aciertos = 0, objetivo = null, bloqueado = false;

    const decirPregunta = () => api.decir(`¿Cuál es la sombra ${objetivo.n}?`);
    area.querySelector('.btn-repetir').addEventListener('click', decirPregunta);

    function ronda() {
      const cant = aciertos < 6 ? 3 : 4;
      const pool = api.mezclar(objetos.filter(x => x !== objetivo));
      objetivo = pool[0];
      modelo.textContent = objetivo.e;
      modelo.classList.remove('entra'); void modelo.offsetWidth; modelo.classList.add('entra');
      cont.innerHTML = '';
      api.mezclar(pool.slice(0, cant)).forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'sombra';
        b.style.animationDelay = (i * 0.08) + 's';
        b.innerHTML = `<span>${o.e}</span>`;
        b.addEventListener('pointerdown', () => elegir(o, b));
        cont.appendChild(b);
      });
      bloqueado = false;
      decirPregunta();
    }

    function elegir(o, b) {
      if (bloqueado) return;
      if (o === objetivo) {
        bloqueado = true;
        b.classList.add('correcta');   // la sombra se "pinta"
        api.sonido.bien();
        api.estrella(b);
        aciertos++;
        if (aciertos % 5 === 0) { api.despues(500, () => api.festejo()); api.despues(2800, ronda); }
        else { api.decir(api.azar(['¡Muy bien!', '¡Esa es!', '¡Genial!'])); api.despues(1800, ronda); }
      } else {
        b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
        api.sonido.boing();
        api.decir('¡Esa no! Mirá bien la forma.');
      }
    }

    ronda();
  }
});
