// 1. Globos: explotar los globos que suben
App.registrar({
  id: 'globos', nombre: 'Globos', emoji: '🎈', color: '#ff6b9d',
  fondo: 'linear-gradient(#8fd8ff, #e3f6ff)',
  iniciar(area, api) {
    area.innerHTML = '<div class="marcador">🎈 <span>0</span></div>';
    const span = area.querySelector('.marcador span');
    const colores = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff8fab', '#ff924c', '#2ec4b6'];
    const sorpresas = ['', '', '', '⭐', '🐶', '🐱', '❤️', '🌈', '🐸', '🦄'];
    let cuenta = 0;

    function nuevo() {
      const g = document.createElement('div');
      g.className = 'globo';
      const tam = 90 + Math.random() * 50;
      const c = api.azar(colores);
      g.style.cssText = `left:${Math.random() * Math.max(10, area.clientWidth - tam)}px;width:${tam}px;height:${tam * 1.2}px;--c:${c};animation-duration:${6 + Math.random() * 4}s, ${1.6 + Math.random()}s`;
      g.innerHTML = `<span>${api.azar(sorpresas)}</span>`;
      g.addEventListener('pointerdown', () => {
        if (g.dataset.roto) return;
        g.dataset.roto = '1';
        api.sonido.globo();
        const [x, y] = api.centro(g);
        api.chispa(x, y, c);
        const t = getComputedStyle(g).transform;
        g.style.animation = 'none';
        g.style.transform = t === 'none' ? '' : t;
        g.classList.add('roto');
        setTimeout(() => g.remove(), 300);
        cuenta++;
        span.textContent = cuenta;
        if (cuenta % 10 === 0) api.festejo();
      });
      g.addEventListener('animationend', e => { if (e.animationName === 'subir') g.remove(); });
      area.appendChild(g);
    }

    api.decir('¡Explotá los globos!');
    nuevo();
    api.cada(850, () => { if (area.querySelectorAll('.globo').length < 9) nuevo(); });
  }
});
