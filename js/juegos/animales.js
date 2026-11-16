// 2. Animales: tocás el animal y hace su sonido
App.registrar({
  id: 'animales', nombre: 'Animales', emoji: '🐮', color: '#22c55e',
  fondo: 'linear-gradient(#bbf7d0, #fef9c3)',
  iniciar(area, api) {
    const lista = [
      { id: 'vaca', e: '🐮', n: 'La vaca', s: 'muuu' },
      { id: 'perro', e: '🐶', n: 'El perro', s: 'guau guau' },
      { id: 'gato', e: '🐱', n: 'El gato', s: 'miau' },
      { id: 'pato', e: '🦆', n: 'El pato', s: 'cuac cuac' },
      { id: 'pollito', e: '🐥', n: 'El pollito', s: 'pío pío' },
      { id: 'gallina', e: '🐔', n: 'La gallina', s: 'co co co' },
      { id: 'gallo', e: '🐓', n: 'El gallo', s: 'kikirikí' },
      { id: 'leon', e: '🦁', n: 'El león', s: 'grrrr' },
      { id: 'oveja', e: '🐑', n: 'La oveja', s: 'beee' },
      { id: 'rana', e: '🐸', n: 'La rana', s: 'croac croac' },
      { id: 'elefante', e: '🐘', n: 'El elefante', s: 'prruuuu' },
      { id: 'caballo', e: '🐴', n: 'El caballo', s: 'iiiiih' },
      { id: 'cerdo', e: '🐷', n: 'El chanchito', s: 'oinc oinc' },
      { id: 'mono', e: '🐵', n: 'El mono', s: 'uh uh ah ah' }
    ];
    const pasteles = ['#fde68a', '#fecaca', '#bfdbfe', '#ddd6fe', '#bbf7d0', '#fbcfe8'];
    const tocados = new Set();

    area.innerHTML = '<div class="grilla-animales"></div>';
    const g = area.querySelector('.grilla-animales');
    lista.forEach((a, i) => {
      const b = document.createElement('button');
      b.className = 'animal';
      b.style.background = pasteles[i % pasteles.length];
      b.innerHTML = `<span>${a.e}</span>`;
      b.addEventListener('pointerdown', () => {
        const dura = api.sonido.animal(a.id);
        b.classList.remove('salta'); void b.offsetWidth; b.classList.add('salta');
        api.despues(Math.min(dura, 2.4) * 1000 + 150, () => api.decir(`${a.n} hace ${a.s}`));
        if (!tocados.has(a.id)) {
          tocados.add(a.id);
          b.classList.add('visto');
          api.estrella(b);
          if (tocados.size === lista.length) api.despues(2200, () => api.festejo('¡Conociste a todos los animales!'));
        }
      });
      g.appendChild(b);
    });
    api.decir('¡Tocá un animal para escucharlo!');
  }
});
