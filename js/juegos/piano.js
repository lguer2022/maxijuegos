// 3. Piano de colores (con la canción "Estrellita" para mirar y escuchar)
App.registrar({
  id: 'piano', nombre: 'Piano', emoji: '🎹', color: '#8b5cf6',
  fondo: 'linear-gradient(#fef3c7, #fbcfe8)',
  iniciar(area, api) {
    const notas = [262, 294, 330, 349, 392, 440, 494, 523];
    const colores = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#2ec4b6', '#1982c4', '#6a4c93', '#ff8fab'];
    const animales = ['🐶', '🐱', '🐰', '🐸', '🐥', '🐻', '🐼', '🐷'];

    area.innerHTML = '<button class="btn-cancion">🎵 Canción</button><div class="teclado"></div>';
    const tec = area.querySelector('.teclado');
    const teclas = notas.map((f, i) => {
      const t = document.createElement('div');
      t.className = 'tecla';
      t.style.setProperty('--c', colores[i]);
      t.innerHTML = `<span>${animales[i]}</span>`;
      t.addEventListener('pointerdown', e => { e.preventDefault(); tocar(i); });
      tec.appendChild(t);
      return t;
    });

    function tocar(i) {
      api.sonido.nota(notas[i]);
      const t = teclas[i];
      t.classList.remove('activa'); void t.offsetWidth; t.classList.add('activa');
      const r = t.getBoundingClientRect(), ra = area.getBoundingClientRect();
      const n = document.createElement('div');
      n.className = 'nota-flota';
      n.textContent = api.azar(['🎵', '🎶', '♪', '⭐']);
      n.style.left = (r.left + r.width / 2 - ra.left) + 'px';
      n.style.top = (r.top - ra.top + 10) + 'px';
      area.appendChild(n);
      setTimeout(() => n.remove(), 1300);
    }

    // Estrellita (canción tradicional): do do sol sol la la sol – fa fa mi mi re re do
    const cancion = [0, 0, 4, 4, 5, 5, 4, -1, 3, 3, 2, 2, 1, 1, 0];
    let sonando = false;
    area.querySelector('.btn-cancion').addEventListener('click', () => {
      if (sonando) return;
      sonando = true;
      cancion.forEach((n, k) => api.despues(300 + k * 450, () => {
        if (n >= 0) tocar(n);
        if (k === cancion.length - 1) sonando = false;
      }));
    });

    api.decir('¡Tocá las teclas de colores!');
  }
});
