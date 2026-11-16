// 23. Escribir: armar palabras tocando tarjetas con letras, en orden.
// Al principio la palabra se ve clarita en los casilleros para copiarla;
// después aparecen letras de más para elegir.
App.registrar({
  id: 'escribir', nombre: 'Escribir', emoji: '✏️', color: '#0d9488',
  fondo: 'linear-gradient(#ecfeff, #fef3c7)',
  iniciar(area, api) {
    // nivel 1: hasta 4 letras · nivel 2: hasta 5 · nivel 3: todas
    const palabras = [
      { p: 'Sol', e: '☀️' }, { p: 'Oso', e: '🐻' }, { p: 'Casa', e: '🏠' }, { p: 'Auto', e: '🚗' },
      { p: 'Pato', e: '🦆' }, { p: 'Gato', e: '🐱' }, { p: 'Sapo', e: '🐸' }, { p: 'Luna', e: '🌙' },
      { p: 'Vaca', e: '🐮' }, { p: 'Nube', e: '☁️' }, { p: 'Lobo', e: '🐺' }, { p: 'Bebé', e: '👶' },
      { p: 'Taza', e: '☕' }, { p: 'Pera', e: '🍐' }, { p: 'Maxi', e: '👦' }, { p: 'Papá', e: '👨' },
      { p: 'Mamá', e: '👩' }, { p: 'Perro', e: '🐶' }, { p: 'Pilar', e: '👧' }, { p: 'Tomás', e: '👦' },
      { p: 'Máximo', e: '👦' }, { p: 'Delfina', e: '👧' }
    ];
    const nombres = { A: 'a', B: 'be', C: 'ce', D: 'de', E: 'e', F: 'efe', G: 'ge', H: 'hache', I: 'i', J: 'jota', K: 'ka', L: 'ele', M: 'eme', N: 'ene', Ñ: 'eñe', O: 'o', P: 'pe', Q: 'cu', R: 'erre', S: 'ese', T: 'te', U: 'u', V: 've', W: 'doble ve', X: 'equis', Y: 'ye', Z: 'zeta' };
    const sinTilde = l => l.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const nombreLetra = l => nombres[sinTilde(l)] || l;
    const colores = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    const abecedario = 'ABCDEFGILMNOPRSTUV';

    area.innerHTML = `
      <div class="pregunta"><button class="btn-repetir">🔊</button><span>¡Escribí la palabra!</span></div>
      <div class="dibujo-palabra"></div>
      <div class="casilleros"></div>
      <div class="fichas"></div>`;
    const dibujo = area.querySelector('.dibujo-palabra');
    const casEl = area.querySelector('.casilleros');
    const fichasEl = area.querySelector('.fichas');
    let aciertos = 0, actual = null, letras = [], pos = 0, bloqueado = false, casilleros = [];

    const decirPalabra = () => api.decir(`¡Escribamos ${actual.p.toLowerCase()}!`);
    area.querySelector('.btn-repetir').addEventListener('click', decirPalabra);

    function ronda() {
      const max = aciertos < 5 ? 4 : (aciertos < 10 ? 5 : 99);
      actual = api.azar(palabras.filter(w => w.p.length <= max && w !== actual));
      letras = [...actual.p.toUpperCase()];
      pos = 0;
      dibujo.textContent = actual.e;
      dibujo.classList.remove('entra'); void dibujo.offsetWidth; dibujo.classList.add('entra');

      // casilleros con la palabra "fantasma" para copiar (después de 12 aciertos, sólo la primera letra)
      casEl.innerHTML = '';
      casEl.style.setProperty('--n', letras.length);
      casilleros = letras.map((l, i) => {
        const c = document.createElement('div');
        c.className = 'casillero';
        c.innerHTML = `<span class="guia">${aciertos >= 12 && i > 0 ? '' : l}</span>`;
        casEl.appendChild(c);
        return c;
      });
      marcarSiguiente();

      // tarjetas: las letras de la palabra mezcladas, y algunas de más
      const extra = aciertos < 3 ? 0 : (aciertos < 8 ? 2 : 3);
      const sobrantes = api.mezclar([...abecedario].filter(l => !letras.map(sinTilde).includes(l))).slice(0, extra);
      fichasEl.innerHTML = '';
      api.mezclar([...letras, ...sobrantes]).forEach((l, i) => {
        const b = document.createElement('button');
        b.className = 'ficha';
        b.textContent = l;
        b.style.setProperty('--c', colores[i % colores.length]);
        b.style.animationDelay = (i * 0.06) + 's';
        b.addEventListener('pointerdown', () => tocar(l, b));
        fichasEl.appendChild(b);
      });
      bloqueado = false;
      decirPalabra();
    }

    function marcarSiguiente() {
      casilleros.forEach((c, i) => c.classList.toggle('siguiente', i === pos));
    }

    function tocar(l, b) {
      if (bloqueado || b.classList.contains('usada')) return;
      const buscada = letras[pos];
      if (l === buscada) {
        // la tarjeta "vuela" al casillero
        const c = casilleros[pos];
        const [bx, by] = api.centro(b), [cx, cy] = api.centro(c);
        b.style.transition = 'transform .3s ease-in, opacity .3s';
        b.style.transform = `translate(${cx - bx}px, ${cy - by}px) scale(.8)`;
        b.style.opacity = '0';
        b.classList.add('usada');
        const color = b.style.getPropertyValue('--c');
        api.despues(280, () => {
          c.innerHTML = `<span class="letra-puesta" style="color:${color}">${l}</span>`;
          c.classList.add('lleno');
        });
        api.sonido.tono({ f: 520 + pos * 70, dur: 0.15, tipo: 'triangle', vol: 0.2 });
        api.decir(nombreLetra(l));
        pos++;
        marcarSiguiente();
        if (pos === letras.length) terminar();
      } else {
        b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
        api.sonido.boing();
        api.decir(`Esa es la ${nombreLetra(l)}. Buscá la ${nombreLetra(buscada)}.`);
      }
    }

    function terminar() {
      bloqueado = true;
      aciertos++;
      api.despues(700, () => {
        casEl.classList.remove('lista'); void casEl.offsetWidth; casEl.classList.add('lista');
        api.decir(`¡${actual.p}!`);
        api.estrella(casEl);
        if (aciertos % 4 === 0) api.despues(1300, () => api.festejo(`¡Escribiste ${actual.p}!`));
        else api.despues(1100, () => api.sonido.bien());
      });
      api.despues(aciertos % 4 === 0 ? 4600 : 3200, ronda);
    }

    ronda();
  }
});
