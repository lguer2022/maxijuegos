// 4. Colores: "¡Tocá el color rojo!"
App.registrar({
  id: 'colores', nombre: 'Colores', emoji: '🎨', color: '#f97316',
  fondo: 'linear-gradient(#fff7ed, #fde68a)',
  iniciar(area, api) {
    const cols = [
      { n: 'rojo', c: '#ef4444' }, { n: 'azul', c: '#3b82f6' }, { n: 'amarillo', c: '#facc15' },
      { n: 'verde', c: '#22c55e' }, { n: 'naranja', c: '#f97316' }, { n: 'violeta', c: '#8b5cf6' },
      { n: 'rosa', c: '#f472b6' }, { n: 'marrón', c: '#92400e' }
    ];
    area.innerHTML = '<div class="pregunta"><button class="btn-repetir">🔊</button><span></span></div><div class="opciones"></div>';
    const preg = area.querySelector('.pregunta span');
    const cont = area.querySelector('.opciones');
    let aciertos = 0, objetivo = null, bloqueado = false;

    const decirPregunta = () => api.decir(`¡Tocá el color ${objetivo.n}!`);
    area.querySelector('.btn-repetir').addEventListener('click', decirPregunta);

    function ronda() {
      const cant = aciertos < 4 ? 3 : 4;
      const pool = api.mezclar(cols.filter(x => x !== objetivo));
      objetivo = pool[0];
      const opciones = api.mezclar(pool.slice(0, cant));
      preg.innerHTML = `¿Dónde está el <b style="color:${objetivo.c}">${objetivo.n}</b>?`;
      cont.innerHTML = '';
      opciones.forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'mancha';
        b.style.setProperty('--c', o.c);
        b.style.animationDelay = (i * 0.08) + 's';
        b.innerHTML = '<span class="ojo"></span><span class="ojo"></span><span class="boca"></span>';
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
        b.classList.add('correcta');
        api.sonido.bien();
        api.estrella(b, o.c);
        aciertos++;
        if (aciertos % 5 === 0) { api.despues(400, () => api.festejo()); api.despues(2700, ronda); }
        else { api.decir(api.azar(['¡Muy bien!', `¡Sí! Es el ${o.n}`, '¡Genial!'])); api.despues(1700, ronda); }
      } else {
        b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
        api.sonido.boing();
        api.decir(`Ese es el ${o.n}. ¡Probá otra vez!`);
      }
    }

    ronda();
  }
});
