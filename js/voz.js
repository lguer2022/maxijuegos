// Voz en castellano (usa las voces del sistema: celular, tablet o compu).
// Incluye arreglos para fallas conocidas de Chrome con la síntesis de voz.
const Voz = (() => {
  const s = window.speechSynthesis;
  const Utter = window.SpeechSynthesisUtterance;
  let voz = null;
  let pendiente = null;               // texto a decir cuando terminen de cargar las voces
  const vivas = new Set();            // Chrome a veces "pierde" frases si no se guardan
  const malas = new Set();            // voces que fallaron en este dispositivo

  // Voces que suenan bien (se prueban en este orden)
  const lindas = ['diego', 'paulina', 'mónica', 'monica', 'google español de estados unidos', 'google español', 'angélica', 'juan', 'jorge', 'isabela', 'sabina', 'helena', 'laura', 'pablo'];
  // Voces "de juguete" de macOS que suenan raras
  const raras = ['eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley', 'bad news', 'bells', 'boing', 'bubbles', 'cellos', 'jester', 'organ', 'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox', 'albert', 'fred', 'junior', 'kathy', 'ralph'];

  const norm = v => v.lang.replace('_', '-').toLowerCase();

  function espanolas() {
    if (!s) return [];
    return s.getVoices().filter(v => norm(v).startsWith('es'));
  }

  function puntaje(v) {
    const n = v.name.toLowerCase();
    let p = 0;
    if (raras.some(r => n.startsWith(r))) p -= 100;
    const i = lindas.findIndex(l => n.includes(l));
    if (i >= 0) p += 50 - i;
    const l = norm(v);
    if (l === 'es-ar') p += 30;
    else if (l === 'es-419' || l === 'es-us' || l === 'es-mx') p += 20;
    else if (l === 'es-es') p += 10;
    if (v.localService) p += 5;
    return p;
  }

  function elegir() {
    const vs = espanolas().filter(v => !malas.has(v.voiceURI));
    let manual = null;
    try { manual = localStorage.getItem('maxi-voz'); } catch (e) {}
    voz = (manual && vs.find(v => v.voiceURI === manual)) ||
          vs.sort((a, b) => puntaje(b) - puntaje(a))[0] || null;
  }

  if (s) {
    elegir();
    s.addEventListener ? s.addEventListener('voiceschanged', alCargar) : (s.onvoiceschanged = alCargar);
  }

  function alCargar() {
    elegir();
    if (pendiente) { const t = pendiente; pendiente = null; hablar(t, 0); }
  }

  function hablar(texto, intento) {
    const u = new Utter(texto);
    u.lang = voz ? voz.lang : 'es-ES';
    if (voz && intento < 2) u.voice = voz;
    u.rate = CONFIG.vozVelocidad;
    u.pitch = CONFIG.vozTono;
    u.volume = 1;
    vivas.add(u);
    u.onend = () => vivas.delete(u);
    u.onerror = e => {
      vivas.delete(u);
      if (e.error === 'interrupted' || e.error === 'canceled' || intento >= 2) return;
      // Esa voz falló: probar con otra (o con la voz por defecto)
      if (voz) malas.add(voz.voiceURI);
      elegir();
      hablar(texto, intento + 1);
    };
    if (s.paused) s.resume();
    s.speak(u);
  }

  return {
    soportada: !!(s && Utter),

    // Llamar dentro de un toque del usuario: "despierta" la voz en Chrome
    desbloquear() {
      if (!s || !Utter) return;
      try {
        const u = new Utter(' ');
        u.volume = 0;
        vivas.add(u);
        u.onend = u.onerror = () => vivas.delete(u);
        s.speak(u);
      } catch (e) {}
    },

    decir(texto) {
      if (!s || !Utter || Sonido.silencio() || !texto) return;
      // Si todavía no cargaron las voces, esperar un poquito (pasa la primera vez en Chrome)
      if (!s.getVoices().length) {
        pendiente = texto;
        setTimeout(() => { if (pendiente === texto) { pendiente = null; hablar(texto, 0); } }, 1200);
        return;
      }
      if (!voz) elegir();
      if (s.speaking || s.pending) {
        s.cancel();
        // Chrome se traga la frase si se habla justo después de cancelar
        setTimeout(() => hablar(texto, 0), 120);
      } else {
        hablar(texto, 0);
      }
    },

    callar() { pendiente = null; if (s) s.cancel(); },

    // Para la página de prueba de voces
    lista: espanolas,
    actual: () => voz,
    usar(uri) {
      try { uri ? localStorage.setItem('maxi-voz', uri) : localStorage.removeItem('maxi-voz'); } catch (e) {}
      malas.clear();
      elegir();
    }
  };
})();
