// 9. Dale de comer: arrastrar (o tocar) la comida correcta hasta el animal
App.registrar({
  id: 'comida', nombre: 'Dale de comer', emoji: '🥕', color: '#ef4444',
  fondo: 'linear-gradient(#dcfce7, #a7f3d0)',
  iniciar(area, api) {
    const pares = [
      { a: '🐰', an: 'el conejo', c: '🥕', cn: 'zanahoria' },
      { a: '🐵', an: 'el mono', c: '🍌', cn: 'banana' },
      { a: '🐶', an: 'el perro', c: '🦴', cn: 'hueso' },
      { a: '🐱', an: 'el gato', c: '🐟', cn: 'pescado' },
      { a: '🐭', an: 'el ratón', c: '🧀', cn: 'queso' },
      { a: '🐻', an: 'el oso', c: '🍯', cn: 'miel' },
      { a: '🐼', an: 'el panda', c: '🎋', cn: 'bambú' },
      { a: '🐝', an: 'la abeja', c: '🌻', cn: 'flores' },
      { a: '🐮', an: 'la vaca', c: '🌾', cn: 'pasto' },
      { a: '🐿️', an: 'la ardilla', c: '🌰', cn: 'nueces' }
    ];
    const may = s => s[0].toUpperCase() + s.slice(1);

    area.innerHTML = `
      <div class="pregunta"><button class="btn-repetir">🔊</button><span></span></div>
      <div class="comensal"><div class="bicho"></div><div class="plato">🍽️</div></div>
      <div class="comidas"></div>`;
    const preg = area.querySelector('.pregunta span');
    const bicho = area.querySelector('.bicho');
    const cont = area.querySelector('.comidas');
    let aciertos = 0, actual = null, bloqueado = false;

    const decirPregunta = () => api.decir(`¡${may(actual.an)} tiene hambre! ¿Qué come?`);
    area.querySelector('.btn-repetir').addEventListener('click', decirPregunta);

    function ronda() {
      const pool = api.mezclar(pares.filter(x => x !== actual));
      actual = pool[0];
      bicho.textContent = actual.a;
      bicho.className = 'bicho entra';
      preg.textContent = `¿Qué come ${actual.an}?`;
      cont.innerHTML = '';
      api.mezclar(pool.slice(0, 3)).forEach(op => {
        const b = document.createElement('div');
        b.className = 'comidita';
        b.textContent = op.c;
        b._dx = 0; b._dy = 0;
        hacerArrastrable(b, op);
        cont.appendChild(b);
      });
      bloqueado = false;
      decirPregunta();
    }

    function hacerArrastrable(b, op) {
      b.addEventListener('pointerdown', e => {
        if (bloqueado) return;
        e.preventDefault();
        try { b.setPointerCapture(e.pointerId); } catch (_) {}
        const x0 = e.clientX, y0 = e.clientY;
        let movio = false;
        b.classList.add('arrastrando');
        b.style.transition = 'none';
        api.sonido.click();
        const mover = ev => {
          b._dx = ev.clientX - x0; b._dy = ev.clientY - y0;
          if (Math.hypot(b._dx, b._dy) > 10) movio = true;
          b.style.transform = `translate(${b._dx}px, ${b._dy}px) scale(1.2)`;
        };
        const soltar = ev => {
          b.removeEventListener('pointermove', mover);
          b.removeEventListener('pointerup', soltar);
          b.removeEventListener('pointercancel', soltar);
          b.classList.remove('arrastrando');
          const r = bicho.getBoundingClientRect();
          const dentro = ev.clientX > r.left - 40 && ev.clientX < r.right + 40 && ev.clientY > r.top - 40 && ev.clientY < r.bottom + 60;
          if (dentro || !movio) probar(op, b); else volver(b);
        };
        b.addEventListener('pointermove', mover);
        b.addEventListener('pointerup', soltar);
        b.addEventListener('pointercancel', soltar);
      });
    }

    function volver(b) {
      b.style.transition = 'transform .35s cubic-bezier(.3,1.6,.5,1)';
      b.style.transform = '';
      b._dx = 0; b._dy = 0;
    }

    function probar(op, b) {
      if (bloqueado) return;
      if (op === actual) {
        bloqueado = true;
        const [bx, by] = api.centro(b), [ax, ay] = api.centro(bicho);
        b.style.transition = 'transform .4s ease-in, opacity .4s';
        b.style.transform = `translate(${b._dx + ax - bx}px, ${b._dy + ay - by}px) scale(.3)`;
        b.style.opacity = '0';
        api.despues(380, () => {
          bicho.className = 'bicho comiendo';
          api.sonido.masticar();
          api.estrella(bicho);
          aciertos++;
          if (aciertos % 4 === 0) { api.despues(900, () => api.festejo()); api.despues(3400, ronda); }
          else { api.decir('¡Ñam ñam! ¡Qué rico!'); api.despues(2300, ronda); }
        });
      } else {
        volver(b);
        bicho.className = 'bicho'; void bicho.offsetWidth; bicho.className = 'bicho no';
        api.sonido.boing();
        api.decir(`¡Puaj! ${may(actual.an)} no come ${op.cn}.`);
      }
    }

    ronda();
  }
});
