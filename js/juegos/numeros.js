// 20. Números: "¿Dónde está el cuatro?" (del 1 al 5, después hasta el 10)
App.registrar({
  id: 'numeros', nombre: 'Números', emoji: '🔟', color: '#0891b2',
  fondo: 'linear-gradient(#cffafe, #fef9c3)',
  iniciar(area, api) {
    const palabras = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
    const colores = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
    // puntitos como en un dado (en dos filas cuando son más de 5)
    const puntos = n => n <= 5 ? '●'.repeat(n) : '●'.repeat(5) + '<br>' + '●'.repeat(n - 5);

    area.innerHTML = `
      <div class="pregunta"><button class="btn-repetir">🔊</button><span>¿Dónde está el número…?</span></div>
      <div class="premio-numeros"></div>
      <div class="opciones"></div>`;
    const premio = area.querySelector('.premio-numeros');
    const cont = area.querySelector('.opciones');
    let aciertos = 0, objetivo = 0, bloqueado = false;

    const decirPregunta = () => api.decir(`¡Tocá el número ${palabras[objetivo]}!`);
    area.querySelector('.btn-repetir').addEventListener('click', decirPregunta);

    function ronda() {
      const max = aciertos < 5 ? 5 : 10;
      const cant = aciertos < 5 ? 3 : 4;
      let n;
      do { n = api.entero(1, max); } while (n === objetivo);
      objetivo = n;
      const otros = api.mezclar(Array.from({ length: max }, (_, i) => i + 1).filter(x => x !== n)).slice(0, cant - 1);
      premio.innerHTML = '';
      cont.innerHTML = '';
      api.mezclar([n, ...otros]).forEach((x, i) => {
        const b = document.createElement('button');
        b.className = 'numero grande';
        b.style.animationDelay = (i * 0.07) + 's';
        b.innerHTML = `<span class="cifra" style="color:${colores[x - 1]}">${x}</span><span class="puntos">${puntos(x)}</span>`;
        b.addEventListener('pointerdown', () => elegir(x, b));
        cont.appendChild(b);
      });
      bloqueado = false;
      decirPregunta();
    }

    function elegir(x, b) {
      if (bloqueado) return;
      if (x === objetivo) {
        bloqueado = true;
        b.classList.add('correcta');
        api.sonido.bien();
        api.estrella(b);
        aciertos++;
        // aparecen tantas estrellitas como el número, contando
        for (let i = 0; i < x; i++) api.despues(500 + i * 380, () => {
          premio.insertAdjacentHTML('beforeend', '<span>⭐</span>');
          api.sonido.contar(i + 1);
        });
        const fin = 500 + x * 380;
        api.despues(150, () => api.decir(`¡Sí! El ${palabras[x]}`));
        if (aciertos % 5 === 0) { api.despues(fin, () => api.festejo()); api.despues(fin + 2600, ronda); }
        else api.despues(fin + 900, ronda);
      } else {
        b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
        api.sonido.boing();
        api.decir(`Ese es el ${palabras[x]}. ¡Probá otra vez!`);
      }
    }

    ronda();
  }
});
