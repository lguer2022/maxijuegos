// Todos los sonidos se generan con código (Web Audio API): no hacen falta archivos de audio.
const Sonido = (() => {
  let ctx = null;
  let mudo = false;
  try { mudo = localStorage.getItem('maxi-mudo') === '1'; } catch (e) {}

  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function salida(c) {
    if (!c._master) {
      const m = c.createGain();
      m.gain.value = 0.8;
      const comp = c.createDynamicsCompressor();
      m.connect(comp).connect(c.destination);
      c._master = m;
    }
    return c._master;
  }

  function tono({ f = 440, a = null, dur = 0.2, tipo = 'sine', vol = 0.25, en = 0, ataque = 0.01, vib = 0, vibF = 6, filtro = null } = {}) {
    if (mudo) return;
    const c = ac(); if (!c) return;
    const t = c.currentTime + en;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(f, t);
    if (a) o.frequency.exponentialRampToValueAtTime(a, t + dur);
    if (vib) {
      const l = c.createOscillator(), lg = c.createGain();
      l.frequency.value = vibF; lg.gain.value = vib;
      l.connect(lg).connect(o.frequency);
      l.start(t); l.stop(t + dur + 0.05);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let nodo = o;
    if (filtro) {
      const fl = c.createBiquadFilter();
      fl.type = 'lowpass'; fl.frequency.value = filtro;
      o.connect(fl); nodo = fl;
    }
    nodo.connect(g).connect(salida(c));
    o.start(t); o.stop(t + dur + 0.05);
  }

  function ruido({ dur = 0.15, vol = 0.3, en = 0, filtro = 2000, tipo = 'bandpass', q = 1 } = {}) {
    if (mudo) return;
    const c = ac(); if (!c) return;
    const t = c.currentTime + en;
    const n = Math.floor(c.sampleRate * dur);
    const b = c.createBuffer(1, n, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b;
    const fl = c.createBiquadFilter(); fl.type = tipo; fl.frequency.value = filtro; fl.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl).connect(g).connect(salida(c));
    s.start(t);
  }

  const animales = {
    vaca()     { tono({ f: 150, a: 110, dur: 1.1, tipo: 'sawtooth', vol: 0.28, filtro: 600, ataque: 0.15, vib: 3 }); },
    perro()    { [0, 0.25].forEach(e => { tono({ f: 520, a: 260, dur: 0.14, tipo: 'sawtooth', vol: 0.22, en: e, filtro: 1500 }); ruido({ dur: 0.1, vol: 0.2, filtro: 700, en: e }); }); },
    gato()     { tono({ f: 600, a: 900, dur: 0.25, tipo: 'triangle', vol: 0.22, vib: 15 }); tono({ f: 900, a: 550, dur: 0.45, tipo: 'triangle', vol: 0.22, en: 0.22, vib: 15 }); },
    pato()     { [0, 0.2].forEach(e => tono({ f: 600, a: 450, dur: 0.15, tipo: 'sawtooth', vol: 0.18, en: e, filtro: 1800, vib: 40, vibF: 30 })); },
    pollito()  { [0, 0.15, 0.3].forEach(e => tono({ f: 2400, a: 3000, dur: 0.09, vol: 0.15, en: e })); },
    leon()     { ruido({ dur: 1, vol: 0.5, filtro: 250, tipo: 'lowpass' }); tono({ f: 110, a: 70, dur: 1, tipo: 'sawtooth', vol: 0.25, filtro: 400, ataque: 0.1, vib: 8, vibF: 25 }); },
    oveja()    { tono({ f: 450, a: 420, dur: 0.8, tipo: 'sawtooth', vol: 0.18, filtro: 1500, vib: 25, vibF: 9 }); },
    rana()     { [0, 0.22].forEach(e => tono({ f: 180, a: 120, dur: 0.16, tipo: 'square', vol: 0.15, en: e, filtro: 900, vib: 30, vibF: 40 })); },
    elefante() { tono({ f: 350, a: 700, dur: 0.7, tipo: 'sawtooth', vol: 0.2, filtro: 2000, vib: 20, vibF: 8 }); },
    caballo()  { tono({ f: 900, a: 500, dur: 0.8, tipo: 'sawtooth', vol: 0.15, filtro: 2000, vib: 60, vibF: 14 }); },
    cerdo()    { [0, 0.25].forEach(e => tono({ f: 250, a: 180, dur: 0.15, tipo: 'sawtooth', vol: 0.18, en: e, filtro: 900, vib: 50, vibF: 45 })); },
    mono()     { [0, 0.15, 0.3, 0.5].forEach((e, i) => tono({ f: i < 2 ? 500 : 700, a: i < 2 ? 900 : 1100, dur: 0.12, tipo: 'triangle', vol: 0.2, en: e })); }
  };

  return {
    desbloquear() { ac(); },
    silencio: () => mudo,
    alternar() {
      mudo = !mudo;
      try { localStorage.setItem('maxi-mudo', mudo ? '1' : '0'); } catch (e) {}
      return mudo;
    },
    tono, ruido,
    click()     { tono({ f: 660, a: 990, dur: 0.08, tipo: 'triangle', vol: 0.2 }); },
    pop()       { ruido({ dur: 0.08, vol: 0.5, filtro: 1500, q: 0.7 }); tono({ f: 500, a: 1400, dur: 0.09, vol: 0.25 }); },
    bien()      { [523, 659, 784, 1047].forEach((f, i) => tono({ f, dur: 0.25, tipo: 'triangle', vol: 0.22, en: i * 0.09 })); },
    boing()     { tono({ f: 320, a: 140, dur: 0.35, vol: 0.25, vib: 20, vibF: 12 }); },
    voltear()   { tono({ f: 400, a: 700, dur: 0.1, tipo: 'triangle', vol: 0.15 }); },
    brillo()    { tono({ f: 1500 + Math.random() * 1500, dur: 0.12, vol: 0.05 }); },
    whoosh()    { ruido({ dur: 0.5, vol: 0.35, filtro: 800, q: 0.5 }); tono({ f: 200, a: 1200, dur: 0.4, vol: 0.06 }); },
    masticar()  { [0, 0.18, 0.36].forEach(e => { ruido({ dur: 0.08, vol: 0.35, filtro: 900, en: e }); tono({ f: 220, a: 160, dur: 0.1, tipo: 'square', vol: 0.07, en: e, filtro: 800 }); }); },
    contar(n)   { tono({ f: 400 + n * 90, dur: 0.18, tipo: 'triangle', vol: 0.2 }); },
    nota(f)     { tono({ f, dur: 1.1, tipo: 'triangle', vol: 0.3, ataque: 0.005 }); tono({ f: f * 2, dur: 0.5, vol: 0.08, ataque: 0.005 }); },
    fanfarria() {
      const n = [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36], [784, 0.52], [1047, 0.64]];
      n.forEach(([f, e], i) => {
        const d = i === 5 ? 0.6 : 0.18;
        tono({ f, dur: d, tipo: 'square', vol: 0.08, en: e, filtro: 2500 });
        tono({ f: f / 2, dur: d, tipo: 'triangle', vol: 0.15, en: e });
      });
    },
    salto()     { tono({ f: 300, a: 750, dur: 0.22, tipo: 'square', vol: 0.12, filtro: 2000 }); },
    choque()    { ruido({ dur: 0.25, vol: 0.4, filtro: 400, tipo: 'lowpass' }); tono({ f: 200, a: 90, dur: 0.3, tipo: 'triangle', vol: 0.25 }); },
    bocina()    { [0, 0.28].forEach(e => { tono({ f: 392, dur: 0.22, tipo: 'square', vol: 0.09, en: e, filtro: 1800 }); tono({ f: 494, dur: 0.22, tipo: 'square', vol: 0.09, en: e, filtro: 1800 }); }); },
    disparo()   { tono({ f: 900, a: 300, dur: 0.15, vol: 0.18 }); },
    pegar()     { tono({ f: 250, a: 200, dur: 0.08, tipo: 'triangle', vol: 0.18 }); },
    // Motor de auto continuo: devuelve { set(velocidad 0..1), parar() }
    motor() {
      const nada = { set() {}, parar() {} };
      const c = ac(); if (!c) return nada;
      const o = c.createOscillator(), o2 = c.createOscillator();
      const f = c.createBiquadFilter(), g = c.createGain();
      o.type = 'sawtooth'; o2.type = 'square';
      o.frequency.value = 55; o2.frequency.value = 27.5;
      f.type = 'lowpass'; f.frequency.value = 500;
      g.gain.value = 0.0001;
      o.connect(f); o2.connect(f); f.connect(g).connect(salida(c));
      o.start(); o2.start();
      let parado = false;
      return {
        set(v) {
          if (parado) return;
          const t = c.currentTime;
          o.frequency.setTargetAtTime(55 + v * 120, t, 0.08);
          o2.frequency.setTargetAtTime(27.5 + v * 60, t, 0.08);
          f.frequency.setTargetAtTime(400 + v * 900, t, 0.08);
          g.gain.setTargetAtTime(mudo ? 0.0001 : 0.025 + v * 0.06, t, 0.08);
        },
        parar() {
          if (parado) return; parado = true;
          g.gain.setTargetAtTime(0.0001, c.currentTime, 0.05);
          setTimeout(() => { try { o.stop(); o2.stop(); } catch (e) {} }, 400);
        }
      };
    },
    animal(id) { animales[id] && animales[id](); }
  };
})();
