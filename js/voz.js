// Voz en castellano (usa las voces del sistema: celular, tablet o compu).
// Incluye arreglos para fallas conocidas de Chrome (sobre todo en Android),
// donde cortar una frase y empezar otra enseguida da el error "interrupted".
const Voz = (() => {
  const s = window.speechSynthesis;
  const Utter = window.SpeechSynthesisUtterance;
  let voz = null;
  let pedido = 0;                     // número del último pedido de hablar
  let activa = null;                  // frase que está sonando ahora
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
    if (s.addEventListener) s.addEventListener('voiceschanged', elegir);
    else s.onvoiceschanged = elegir;
  }

  // Habla una frase. Si Chrome la interrumpe sin que nosotros lo pidamos, reintenta.
  function hablar(texto, n, op, intento) {
    if (n !== pedido) return;                       // ya pidieron otra frase
    const v = op.voz || voz;
    const u = new Utter(texto);
    u.lang = v ? v.lang : 'es-ES';
    if (v && !op.sinVoz) u.voice = v;
    u.rate = CONFIG.vozVelocidad;
    u.pitch = CONFIG.vozTono;
    u.volume = 1;
    vivas.add(u);
    const fin = () => { vivas.delete(u); if (activa === u) activa = null; };
    u.onstart = () => { activa = u; op.al && op.al('empezo'); };
    u.onend = () => { fin(); op.al && op.al('termino'); };
    u.onerror = e => {
      fin();
      if (n !== pedido) return;                     // la cortamos nosotros a propósito
      if (intento >= 3) { op.al && op.al('error', e.error); return; }
      if (e.error === 'interrupted' || e.error === 'canceled') {
        // Chrome en Android la cortó solo: esperar un poco y volver a intentar
        setTimeout(() => hablar(texto, n, op, intento + 1), 350);
      } else {
        // Esa voz no anda en este dispositivo: probar con otra o con la de por defecto
        if (v && !op.voz) { malas.add(v.voiceURI); elegir(); }
        hablar(texto, n, Object.assign({}, op, intento >= 1 ? { sinVoz: true } : {}), intento + 1);
      }
    };
    if (s.paused) s.resume();
    s.speak(u);
  }

  function decir(texto, op) {
    op = op || {};
    if (!s || !Utter || !texto) return;
    if (Sonido.silencio() && !op.voz) return;
    const n = ++pedido;
    if (!voz) elegir();
    // Si todavía no cargaron las voces (pasa la primera vez), esperar un poquito
    const demora = s.getVoices().length ? 0 : 900;
    if (activa || s.speaking || s.pending) {
      s.cancel();
      // En Android, cancelar es lento: si se habla enseguida, la frase nueva se corta
      setTimeout(() => hablar(texto, n, op, 0), Math.max(demora, 300));
    } else if (demora) {
      setTimeout(() => { if (!voz) elegir(); hablar(texto, n, op, 0); }, demora);
    } else {
      hablar(texto, n, op, 0);
    }
  }

  return {
    soportada: !!(s && Utter),
    desbloquear() { if (s && s.paused) s.resume(); },
    decir,
    callar() { pedido++; if (s && (activa || s.speaking || s.pending)) s.cancel(); },

    // Para la página de prueba de voces
    lista: espanolas,
    actual: () => voz,
    probar(v, texto, al) { decir(texto, { voz: v, al }); },
    usar(uri) {
      try { uri ? localStorage.setItem('maxi-voz', uri) : localStorage.removeItem('maxi-voz'); } catch (e) {}
      malas.clear();
      elegir();
    }
  };
})();
