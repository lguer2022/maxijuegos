// 15. ¿Qué sigue?: completar la serie (patrones AB, AAB, ABB, ABC)
App.registrar({
  id: 'quesigue', nombre: '¿Qué sigue?', emoji: '🔁', color: '#14b8a6',
  fondo: 'linear-gradient(#ccfbf1, #e0e7ff)',
  iniciar(area, api) {
    const grupos = [
      ['🍎', '🍌', '🍇', '🍓', '🍊'],
      ['🐶', '🐱', '🐰', '🐸', '🐷'],
      ['🔴', '🔵', '🟡', '🟢', '🟣'],
      ['⭐', '🌙', '☀️', '☁️', '🌈'],
      ['🚗', '🚌', '🚲', '✈️', '🚀'],
      ['❤️', '💙', '💛', '💚', '💜']
    ];
    const patrones = [
      ['A', 'B'],                                    // nivel 1
      ['A', 'A', 'B'], ['A', 'B', 'B'], ['A', 'B', 'C']  // nivel 2
    ];

    area.innerHTML = `
      <div class="pregunta"><button class="btn-repetir">🔊</button><span>¿Qué sigue?</span></div>
      <div class="serie"></div>
      <div class="opciones"></div>`;
    const serie = area.querySelector('.serie');
    const cont = area.querySelector('.opciones');
    let aciertos = 0, respuesta = null, bloqueado = false, items = [];

    const decirPregunta = () => api.decir('¿Qué sigue?');
    area.querySelector('.btn-repetir').addEventListener('click', decirPregunta);

    function ronda() {
      const patron = aciertos < 4 ? patrones[0] : api.azar(patrones);
      const figuras = api.mezclar(api.azar(grupos)).slice(0, 3);
      const mapa = { A: figuras[0], B: figuras[1], C: figuras[2] };
      const largo = patron.length === 2 ? 5 : (patron.length * 2 + 1);
      const secuencia = Array.from({ length: largo + 1 }, (_, i) => mapa[patron[i % patron.length]]);
      respuesta = secuencia[largo];

      serie.innerHTML = '';
      items = secuencia.slice(0, largo).map((f, i) => {
        const d = document.createElement('div');
        d.className = 'item'; d.textContent = f; d.style.animationDelay = (i * 0.08) + 's';
        serie.appendChild(d);
        return d;
      });
      const hueco = document.createElement('div');
      hueco.className = 'item hueco'; hueco.textContent = '?'; hueco.style.animationDelay = (largo * 0.08) + 's';
      serie.appendChild(hueco);
      items.push(hueco);

      const usadas = [...new Set(Object.values(mapa).slice(0, patron.length))];
      const extra = api.azar(grupos.flat().filter(f => !usadas.includes(f)));
      const opciones = api.mezclar([...new Set([...usadas, extra])]).slice(0, 3);
      if (!opciones.includes(respuesta)) opciones[0] = respuesta;
      cont.innerHTML = '';
      api.mezclar(opciones).forEach((f, i) => {
        const b = document.createElement('button');
        b.className = 'opcion-item'; b.textContent = f; b.style.animationDelay = (i * 0.08) + 's';
        b.addEventListener('pointerdown', () => elegir(f, b));
        cont.appendChild(b);
      });
      bloqueado = false;
      decirPregunta();
    }

    function cantar() {
      // la serie "canta": cada figura salta con una nota
      const notas = [523, 587, 659, 698, 784, 880, 988, 1047];
      items.forEach((d, i) => api.despues(i * 220, () => {
        d.classList.remove('canta'); void d.offsetWidth; d.classList.add('canta');
        api.sonido.tono({ f: notas[i % notas.length], dur: 0.2, tipo: 'triangle', vol: 0.2 });
      }));
    }

    function elegir(f, b) {
      if (bloqueado) return;
      if (f === respuesta) {
        bloqueado = true;
        const hueco = serie.querySelector('.hueco');
        hueco.textContent = f; hueco.classList.remove('hueco');
        b.classList.add('correcta');
        api.estrella(b);
        aciertos++;
        cantar();
        const espera = items.length * 220 + 400;
        if (aciertos % 5 === 0) { api.despues(espera, () => api.festejo()); api.despues(espera + 2500, ronda); }
        else { api.despues(espera, () => api.decir('¡Muy bien!')); api.despues(espera + 1400, ronda); }
      } else {
        b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
        api.sonido.boing();
        api.decir('¡Mirá bien cómo se repite!');
      }
    }

    ronda();
  }
});
