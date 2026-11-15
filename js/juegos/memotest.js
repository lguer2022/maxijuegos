// 6. Memotest: encontrar las parejas (empieza con 3 parejas y va subiendo)
App.registrar({
  id: 'memotest', nombre: 'Memotest', emoji: '🃏', color: '#a855f7',
  fondo: 'linear-gradient(#f3e8ff, #cffafe)',
  iniciar(area, api) {
    const figuras = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🦁', '🐷', '🐮', '🐥'];
    const niveles = [{ n: 6, cols: 3 }, { n: 8, cols: 4 }, { n: 10, cols: 5 }, { n: 12, cols: 4 }];
    let nivel = 0;

    function ronda() {
      const { n, cols } = niveles[Math.min(nivel, niveles.length - 1)];
      const elegidas = api.mezclar(figuras).slice(0, n / 2);
      const cartas = api.mezclar([...elegidas, ...elegidas]);
      area.innerHTML = '<div class="memo"></div>';
      const m = area.querySelector('.memo');
      m.style.setProperty('--cols', cols);
      m.style.setProperty('--filas', Math.ceil(n / cols));
      let abiertas = [], bloqueo = false, pares = 0;

      cartas.forEach((f, i) => {
        const c = document.createElement('div');
        c.className = 'carta';
        c.style.animationDelay = (i * 0.05) + 's';
        c.dataset.f = f;
        c.innerHTML = `<div class="cara frente">⭐</div><div class="cara dorso">${f}</div>`;
        c.addEventListener('pointerdown', () => {
          if (bloqueo || c.classList.contains('abierta')) return;
          api.sonido.voltear();
          c.classList.add('abierta');
          abiertas.push(c);
          if (abiertas.length < 2) return;
          bloqueo = true;
          const [a, b] = abiertas;
          if (a.dataset.f === b.dataset.f) {
            api.despues(400, () => {
              a.classList.add('par'); b.classList.add('par');
              api.sonido.bien();
              api.chispa(...api.centro(a)); api.chispa(...api.centro(b));
              abiertas = []; bloqueo = false; pares++;
              if (pares === n / 2) {
                api.despues(600, () => api.festejo());
                nivel++;
                api.despues(3200, ronda);
              }
            });
          } else {
            api.despues(1000, () => {
              a.classList.remove('abierta'); b.classList.remove('abierta');
              abiertas = []; bloqueo = false;
            });
          }
        });
        m.appendChild(c);
      });
      api.decir('¡Encontrá las parejas!');
    }

    ronda();
  }
});
