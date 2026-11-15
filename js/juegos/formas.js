// 5. Formas: "¡Tocá la estrella!"
App.registrar({
  id: 'formas', nombre: 'Formas', emoji: '🔺', color: '#0ea5e9',
  fondo: 'linear-gradient(#e0f2fe, #ede9fe)',
  iniciar(area, api) {
    const formas = [
      { n: 'el círculo', svg: '<circle cx="50" cy="50" r="42"/>' },
      { n: 'el cuadrado', svg: '<rect x="10" y="10" width="80" height="80" rx="6"/>' },
      { n: 'el triángulo', svg: '<polygon points="50,8 94,90 6,90" stroke-linejoin="round"/>' },
      { n: 'la estrella', svg: '<polygon points="50,5 61,38 96,38 68,59 79,93 50,72 21,93 32,59 4,38 39,38"/>' },
      { n: 'el corazón', svg: '<path d="M50 90 L12 52 A22 22 0 0 1 50 18 A22 22 0 0 1 88 52 Z"/>' },
      { n: 'el rectángulo', svg: '<rect x="4" y="24" width="92" height="52" rx="6"/>' }
    ];
    const colores = ['#ef4444', '#3b82f6', '#facc15', '#22c55e', '#f97316', '#8b5cf6', '#ec4899'];

    area.innerHTML = '<div class="pregunta"><button class="btn-repetir">🔊</button><span></span></div><div class="opciones"></div>';
    const preg = area.querySelector('.pregunta span');
    const cont = area.querySelector('.opciones');
    let aciertos = 0, objetivo = null, bloqueado = false;

    const decirPregunta = () => api.decir(`¡Tocá ${objetivo.n}!`);
    area.querySelector('.btn-repetir').addEventListener('click', decirPregunta);

    function ronda() {
      const cant = aciertos < 4 ? 3 : 4;
      const pool = api.mezclar(formas.filter(x => x !== objetivo));
      objetivo = pool[0];
      const opciones = api.mezclar(pool.slice(0, cant));
      const cs = api.mezclar(colores);
      preg.innerHTML = `¿Dónde está <b>${objetivo.n}</b>?`;
      cont.innerHTML = '';
      opciones.forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'forma';
        b.style.animationDelay = (i * 0.08) + 's';
        b.innerHTML = `<svg viewBox="0 0 100 100" fill="${cs[i]}" stroke="rgba(0,0,0,.15)" stroke-width="3">${o.svg}</svg>`;
        b.addEventListener('pointerdown', () => elegir(o, b, cs[i]));
        cont.appendChild(b);
      });
      bloqueado = false;
      decirPregunta();
    }

    function elegir(o, b, c) {
      if (bloqueado) return;
      if (o === objetivo) {
        bloqueado = true;
        b.classList.add('correcta');
        api.sonido.bien();
        api.estrella(b, c);
        aciertos++;
        if (aciertos % 5 === 0) { api.despues(400, () => api.festejo()); api.despues(2700, ronda); }
        else { api.decir(`¡Sí! Es ${o.n}`); api.despues(1700, ronda); }
      } else {
        b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
        api.sonido.boing();
        api.decir(`Eso es ${o.n.replace('la ', 'una ').replace('el ', 'un ')}. ¡Probá otra vez!`);
      }
    }

    ronda();
  }
});
