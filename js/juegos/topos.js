// 17. Topos: los animalitos asoman de los agujeros y hay que tocarlos antes de que se escondan
App.registrar({
  id: 'topos', nombre: 'Topos', emoji: '🐹', color: '#a16207',
  fondo: 'linear-gradient(#bbf7d0, #86efac)',
  iniciar(area, api) {
    const animalitos = ['🐹', '🐭', '🐰', '🐻', '🐸', '🐵', '🐶', '🐱'];
    area.innerHTML = '<div class="marcador">🔨 <span>0</span></div><div class="campo-topos"></div>';
    const span = area.querySelector('.marcador span');
    const campo = area.querySelector('.campo-topos');
    let puntos = 0;

    const pozos = Array.from({ length: 9 }, () => {
      const p = document.createElement('div');
      p.className = 'pozo';
      p.innerHTML = '<div class="ventana"><button class="topo"></button></div><div class="tierra"></div>';
      const topo = p.querySelector('.topo');
      const estado = { arriba: false, golpeado: false, hasta: 0 };
      topo.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (!estado.arriba || estado.golpeado) return;
        estado.golpeado = true;
        api.sonido.bonk();
        api.chispa(...api.centro(topo));
        topo.classList.add('mareado');
        puntos++; span.textContent = puntos;
        if (puntos % 10 === 0) api.festejo();
        else if (puntos % 3 === 0) api.estrella(null);
        api.despues(450, () => bajar(p, estado));
      });
      campo.appendChild(p);
      return { p, topo, estado };
    });

    function bajar(p, estado) {
      estado.arriba = false;
      p.classList.remove('arriba');
    }

    function asomar() {
      const libres = pozos.filter(x => !x.estado.arriba);
      if (!libres.length) return;
      const x = api.azar(libres);
      x.estado.arriba = true; x.estado.golpeado = false;
      x.topo.textContent = api.azar(animalitos);
      x.topo.classList.remove('mareado');
      x.p.classList.add('arriba');
      api.sonido.asoma();
      // cuanto más puntos, un poquito más rápido (pero siempre tranquilo)
      const tiempo = Math.max(1100, 2200 - puntos * 30);
      api.despues(tiempo, () => { if (!x.estado.golpeado) bajar(x.p, x.estado); });
    }

    let espera = 0;
    api.cada(100, () => {
      espera -= 100;
      if (espera > 0) return;
      asomar();
      if (puntos > 12 && Math.random() < 0.35) api.despues(300, asomar);   // a veces salen dos
      espera = Math.max(700, 1300 - puntos * 20);
    });

    api.decir('¡Tocá los animalitos cuando salen del pozo!');
  }
});
