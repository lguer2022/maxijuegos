// 21. Mamás y bebés: encontrar el bebé de cada mamá
App.registrar({
  id: 'mamas', nombre: 'Mamás y bebés', emoji: '🐣', color: '#f472b6',
  fondo: 'linear-gradient(#fce7f3, #fef9c3)',
  iniciar(area, api) {
    // El bebé se dibuja como una versión chiquita de la mamá (salvo pollito y oruga)
    const familias = [
      { m: '🐄', b: '🐄', mn: 'la vaca', bn: 'el ternero', id: 'vaca' },
      { m: '🐎', b: '🐎', mn: 'la yegua', bn: 'el potrillo', id: 'caballo' },
      { m: '🐕', b: '🐕', mn: 'la perra', bn: 'el cachorrito', id: 'perro' },
      { m: '🐈', b: '🐈', mn: 'la gata', bn: 'el gatito', id: 'gato' },
      { m: '🐔', b: '🐥', mn: 'la gallina', bn: 'el pollito', id: 'pollito' },
      { m: '🐑', b: '🐑', mn: 'la oveja', bn: 'el corderito', id: 'oveja' },
      { m: '🐖', b: '🐖', mn: 'la chancha', bn: 'el lechoncito', id: 'cerdo' },
      { m: '🦆', b: '🦆', mn: 'la pata', bn: 'el patito', id: 'pato' },
      { m: '🐘', b: '🐘', mn: 'la elefanta', bn: 'el elefantito', id: 'elefante' },
      { m: '🐒', b: '🐒', mn: 'la mona', bn: 'el monito', id: 'mono' },
      { m: '🦋', b: '🐛', mn: 'la mariposa', bn: 'la oruga', id: null },
      { m: '🦁', b: '🦁', mn: 'la leona', bn: 'el cachorro de león', id: 'leon' }
    ];
    const may = s => s[0].toUpperCase() + s.slice(1);

    area.innerHTML = `
      <div class="pregunta"><button class="btn-repetir">🔊</button><span></span></div>
      <div class="mama"><span class="cara"></span><span class="corazones"></span></div>
      <div class="opciones"></div>`;
    const preg = area.querySelector('.pregunta span');
    const mama = area.querySelector('.mama');
    const cara = area.querySelector('.mama .cara');
    const cont = area.querySelector('.opciones');
    let aciertos = 0, actual = null, bloqueado = false;

    const decirPregunta = () => api.decir(`¿Dónde está el bebé de ${actual.mn}?`);
    area.querySelector('.btn-repetir').addEventListener('click', decirPregunta);

    function ronda() {
      actual = api.azar(familias.filter(f => f !== actual));
      cara.textContent = actual.m;
      mama.classList.remove('entra', 'feliz'); void mama.offsetWidth; mama.classList.add('entra');
      mama.querySelector('.corazones').textContent = '';
      preg.textContent = `¿Dónde está el bebé de ${actual.mn}?`;
      const cant = aciertos < 5 ? 3 : 4;
      const opciones = api.mezclar([actual, ...api.mezclar(familias.filter(f => f !== actual && f.b !== actual.b)).slice(0, cant - 1)]);
      cont.innerHTML = '';
      opciones.forEach((f, i) => {
        const b = document.createElement('button');
        b.className = 'bebe';
        b.style.animationDelay = (i * 0.08) + 's';
        b.innerHTML = `<span>${f.b}</span>`;
        b.addEventListener('pointerdown', () => elegir(f, b));
        cont.appendChild(b);
      });
      bloqueado = false;
      decirPregunta();
    }

    function elegir(f, b) {
      if (bloqueado) return;
      if (f === actual) {
        bloqueado = true;
        // el bebé va con su mamá
        const [bx, by] = api.centro(b), [mx, my] = api.centro(mama);
        b.style.transition = 'transform .5s ease-in-out';
        b.style.transform = `translate(${mx - bx + 40}px, ${my - by + 30}px) scale(.9)`;
        b.style.zIndex = 5;
        api.despues(500, () => {
          mama.classList.add('feliz');
          mama.querySelector('.corazones').textContent = '❤️ ❤️ ❤️';
          if (f.id) api.sonido.animal(f.id); else api.sonido.bien();
          api.estrella(mama);
          aciertos++;
          const frase = f.id ? `¡Sí! ¡${may(f.mn)} y ${f.bn}!` : '¡Sí! ¡La oruga, cuando crece, se convierte en mariposa!';
          api.despues(700, () => api.decir(frase));
          if (aciertos % 5 === 0) { api.despues(2600, () => api.festejo()); api.despues(5000, ronda); }
          else api.despues(f.id ? 3000 : 4200, ronda);
        });
      } else {
        b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
        api.sonido.boing();
        api.decir(`Ese es ${f.bn}. ¡Su mamá es ${f.mn}!`);
      }
    }

    ronda();
  }
});
