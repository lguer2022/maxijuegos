// 21. Mamás y bebés: con fotos reales.
// Nivel 1: se ve la mamá y hay que encontrar a su bebé.
// Después también al revés: se ve el bebé y hay que encontrar a su mamá.
App.registrar({
  id: 'mamas', nombre: 'Mamás y bebés', emoji: '🐣', color: '#f472b6',
  fondo: 'linear-gradient(#fce7f3, #fef9c3)',
  iniciar(area, api) {
    // Fotos en imagenes/mamas/<id>-mama.jpg y <id>-bebe.jpg (si falta alguna, se usa el emoji)
    const familias = [
      { id: 'vaca', e: '🐄', mn: 'la vaca', bn: 'el ternero', son: 'vaca' },
      { id: 'caballo', e: '🐎', mn: 'la yegua', bn: 'el potrillo', son: 'caballo' },
      { id: 'perro', e: '🐕', mn: 'la perra', bn: 'el cachorrito', son: 'perro' },
      { id: 'gato', e: '🐈', mn: 'la gata', bn: 'el gatito', son: 'gato' },
      { id: 'gallina', e: '🐔', mn: 'la gallina', bn: 'el pollito', son: 'pollito' },
      { id: 'oveja', e: '🐑', mn: 'la oveja', bn: 'el corderito', son: 'oveja' },
      { id: 'cerdo', e: '🐖', mn: 'la chancha', bn: 'el lechoncito', son: 'cerdo' },
      { id: 'pato', e: '🦆', mn: 'la pata', bn: 'el patito', son: 'pato' },
      { id: 'elefante', e: '🐘', mn: 'la elefanta', bn: 'el elefantito', son: 'elefante' },
      { id: 'mono', e: '🐒', mn: 'la mona', bn: 'el monito', son: 'mono' },
      { id: 'leon', e: '🦁', mn: 'la leona', bn: 'el cachorro de león', son: 'leon' },
      { id: 'oso', e: '🐻', mn: 'la osa', bn: 'el osito', son: null }
    ];
    const may = s => s[0].toUpperCase() + s.slice(1);
    const foto = (f, quien) => `imagenes/mamas/${f.id}-${quien}.jpg`;

    // Muestra la foto; si no carga, pone el emoji (el bebé, más chiquito)
    function imagen(f, quien) {
      const img = document.createElement('img');
      img.className = 'foto-animal';
      img.alt = quien === 'mama' ? f.mn : f.bn;
      img.draggable = false;
      img.src = foto(f, quien);
      img.onerror = () => {
        const s = document.createElement('span');
        s.className = 'foto-emoji' + (quien === 'bebe' ? ' chico' : '');
        s.textContent = f.e;
        img.replaceWith(s);
      };
      return img;
    }

    area.innerHTML = `
      <div class="pregunta"><button class="btn-repetir">🔊</button><span></span></div>
      <div class="mama-foto"></div>
      <div class="opciones opciones-fotos"></div>`;
    const preg = area.querySelector('.pregunta span');
    const centro = area.querySelector('.mama-foto');
    const cont = area.querySelector('.opciones');
    let aciertos = 0, actual = null, modo = 'bebe', bloqueado = false;

    const textoPregunta = () => modo === 'bebe'
      ? `¿Dónde está el bebé de ${actual.mn}?`
      : `¿Dónde está la mamá de ${actual.bn}?`;
    const decirPregunta = () => api.decir(textoPregunta());
    area.querySelector('.btn-repetir').addEventListener('click', decirPregunta);

    function ronda() {
      actual = api.azar(familias.filter(f => f !== actual));
      // a partir del acierto 6, a veces se juega al revés
      modo = aciertos >= 6 && Math.random() < 0.5 ? 'mama' : 'bebe';
      const cant = aciertos < 10 ? 3 : 4;
      const otros = api.mezclar(familias.filter(f => f !== actual)).slice(0, cant - 1);
      const opciones = api.mezclar([actual, ...otros]);

      centro.innerHTML = '';
      centro.className = 'mama-foto';
      void centro.offsetWidth;
      centro.className = 'mama-foto entra';
      centro.appendChild(imagen(actual, modo === 'bebe' ? 'mama' : 'bebe'));
      preg.textContent = textoPregunta();

      cont.innerHTML = '';
      opciones.forEach((f, i) => {
        const b = document.createElement('button');
        b.className = 'opcion-foto';
        b.style.animationDelay = (i * 0.08) + 's';
        b.appendChild(imagen(f, modo === 'bebe' ? 'bebe' : 'mama'));
        b.addEventListener('pointerdown', () => elegir(f, b));
        cont.appendChild(b);
      });
      bloqueado = false;
      decirPregunta();
    }

    function festejoFamilia(f) {
      // la mamá y el bebé juntos, con corazones
      const d = document.createElement('div');
      d.className = 'familia-junta';
      const caja = document.createElement('div');
      caja.className = 'familia-caja';
      caja.appendChild(imagen(f, 'mama'));
      caja.insertAdjacentHTML('beforeend', '<span class="corazon">❤️</span>');
      caja.appendChild(imagen(f, 'bebe'));
      caja.insertAdjacentHTML('beforeend', `<div class="familia-nombre">${may(f.mn)} y ${f.bn}</div>`);
      d.appendChild(caja);
      area.appendChild(d);
      return d;
    }

    function elegir(f, b) {
      if (bloqueado) return;
      if (f === actual) {
        bloqueado = true;
        b.classList.add('correcta');
        api.estrella(b);
        aciertos++;
        const d = festejoFamilia(f);
        const dura = f.son ? api.sonido.animal(f.son) : (api.sonido.bien(), 0.6);
        const habla = Math.min(dura, 2.4) * 1000 + 200;
        api.despues(habla, () => api.decir(`¡Sí! ¡${may(f.mn)} y ${f.bn}!`));
        api.despues(habla + 2200, () => d.remove());
        if (aciertos % 5 === 0) { api.despues(habla + 2300, () => api.festejo()); api.despues(habla + 4700, ronda); }
        else api.despues(habla + 2500, ronda);
      } else {
        b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
        api.sonido.boing();
        api.decir(modo === 'bebe'
          ? `Ese es ${f.bn}, el bebé de ${f.mn}. ¡Probá otra vez!`
          : `Esa es ${f.mn}, la mamá de ${f.bn}. ¡Probá otra vez!`);
      }
    }

    ronda();
  }
});
