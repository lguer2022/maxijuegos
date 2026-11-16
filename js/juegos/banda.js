// 19. Banda de música: instrumentos para tocar, con un ritmo de fondo y animales que bailan
App.registrar({
  id: 'banda', nombre: 'Banda', emoji: '🥁', color: '#7c3aed',
  fondo: 'linear-gradient(#312e81, #6d28d9 60%, #db2777)',
  iniciar(area, api) {
    const S = api.sonido;
    // Escala pentatónica: toque lo que toque, siempre suena lindo
    const escala = [262, 294, 330, 392, 440, 523, 587, 659];
    let paso = 0;
    const nota = () => { const f = escala[paso % escala.length]; paso += api.azar([1, 1, 2, -1]); if (paso < 0) paso = 2; return f; };

    const instrumentos = [
      { e: '🥁', n: 'Tambor', c: '#ef4444', tocar: () => S.bombo() },
      { e: '🪘', n: 'Redoblante', c: '#f97316', tocar: () => S.redoblante(), alt: '🥁' },
      { e: '🔔', n: 'Campana', c: '#eab308', tocar: () => S.campana(nota() * 2) },
      { e: '🎺', n: 'Trompeta', c: '#f59e0b', tocar: () => S.trompeta(nota()) },
      { e: '🎸', n: 'Guitarra', c: '#22c55e', tocar: () => S.guitarra(nota() / 2) },
      { e: '🎷', n: 'Saxo', c: '#06b6d4', tocar: () => S.flauta(nota() * 1.5) },
      { e: '🪇', n: 'Maracas', c: '#3b82f6', tocar: () => S.maracas(), alt: '🎉' },
      { e: '👏', n: 'Aplausos', c: '#ec4899', tocar: () => S.aplausos() },
      { e: '💥', n: 'Platillo', c: '#a855f7', tocar: () => S.platillo() }
    ];

    area.innerHTML = `
      <div class="bailarines"><span>🐻</span><span>🐸</span><span>🐵</span><span>🐰</span></div>
      <button class="btn-ritmo">▶ Ritmo</button>
      <div class="instrumentos"></div>`;
    const bail = [...area.querySelectorAll('.bailarines span')];
    const cont = area.querySelector('.instrumentos');
    const btnRitmo = area.querySelector('.btn-ritmo');

    // Algunos emojis nuevos no existen en tablets viejas: usar uno de repuesto
    const existe = (() => {
      const c = document.createElement('canvas').getContext('2d');
      c.canvas.width = c.canvas.height = 20;
      return e => {
        c.clearRect(0, 0, 20, 20); c.font = '16px sans-serif'; c.textBaseline = 'top';
        c.fillStyle = '#000'; c.fillText(e, 0, 0);
        const d = c.getImageData(0, 0, 20, 20).data;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] && (d[i] !== d[i + 1] || d[i + 1] !== d[i + 2])) return true;
        return false;
      };
    })();

    function bailar(i) {
      const b = bail[i % bail.length];
      b.classList.remove('baila'); void b.offsetWidth; b.classList.add('baila');
    }

    instrumentos.forEach((ins, i) => {
      const b = document.createElement('button');
      b.className = 'instrumento';
      b.style.setProperty('--c', ins.c);
      const emo = ins.alt && !existe(ins.e) ? ins.alt : ins.e;
      b.innerHTML = `<span class="ico">${emo}</span><span class="nom">${ins.n}</span>`;
      b.addEventListener('pointerdown', e => {
        e.preventDefault();
        ins.tocar();
        b.classList.remove('suena'); void b.offsetWidth; b.classList.add('suena');
        bailar(i);
        const [x, y] = api.centro(b);
        if (Math.random() < 0.5) api.chispa(x, y, ins.c);
      });
      cont.appendChild(b);
    });

    // Ritmo de fondo (bum – chas – bum bum – chas)
    let ritmo = null, tiempo = 0;
    const patron = [['bombo', 'hihat'], ['hihat'], ['redoblante', 'hihat'], ['hihat'], ['bombo', 'hihat'], ['bombo', 'hihat'], ['redoblante', 'hihat'], ['hihat']];
    btnRitmo.addEventListener('click', () => {
      if (ritmo) {
        clearInterval(ritmo); ritmo = null;
        btnRitmo.textContent = '▶ Ritmo'; btnRitmo.classList.remove('activo');
        return;
      }
      btnRitmo.textContent = '⏸ Parar'; btnRitmo.classList.add('activo');
      tiempo = 0;
      ritmo = api.cada(260, () => {
        patron[tiempo % patron.length].forEach(n => S[n]());
        if (tiempo % 2 === 0) bail.forEach((_, i) => bailar(i));
        tiempo++;
      });
    });

    api.decir('¡Tocá los instrumentos! Y apretá Ritmo para que suene la música.');
  }
});
