// Page transition: "Relleno por cuadros" (Design Lab, variant Píxeles). Kept at Àlex's request (9 Oct 2026).
// A grid of squares (16 columns on desktop, 8 on phones) covers the screen in random order, each cell 420 ms
// from its centre with a spring curve; it covers in 1200 ms, holds 110 ms and retracts the same way.
// One flat colour per transition, chosen by the destination page. Loaded in <head> so the arriving page is
// born covered (no flash). Off with prefers-reduced-motion, and can be switched off with PAGE_TRANSITION=false.
(function () {
  var DUR = 420, HOLD = 110, SPREAD = 780, COVER = SPREAD + DUR;    // 1200 ms (original del Design Lab: 520 / 1229 / 1749)
  var EASE = 'cubic-bezier(.34,1.42,.64,1)';                          // muelle
  var KEY = 'page-tr';

  // Pantone planos (equivalencia en pantalla)
  // Los cuatro colores elegidos por Àlex
  var NARANJA = '#EE4B1C', VIOLETA = '#9863E3', TURQUESA = '#63E3CE', AMARILLO = '#EDD95A';
  // Un color por página (el de la página a la que se va). Páginas vecinas en el menú no repiten.
  var COLORS = {
    '/':                 NARANJA,
    '/que-hacemos/':     VIOLETA,
    '/como-trabajamos/': TURQUESA,
    '/para-quien/':      AMARILLO,
    '/quien-responde/':  NARANJA,
    '/ingenierias/':     TURQUESA,
    '/distribucion/':    AMARILLO,
    '/estudio/':         VIOLETA,
    '/privacidad/':      VIOLETA,
    '/aviso-legal/':     TURQUESA,
    '/contacto/':        TURQUESA,
    '/en/':              NARANJA,
    '/en/what-we-do/':   VIOLETA,
    '/en/how-we-work/':  TURQUESA,
    '/en/who-its-for/':  AMARILLO,
    '/en/who-answers/':  NARANJA,
    '/en/contact/':      TURQUESA
  };
  function slugOf(url) { return url.pathname.replace(/^\/sanuy-web-preview(?=\/|$)/, '') || '/'; }

  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var busy = false;

  function size() {
    var w = window.innerWidth || 1440, h = window.innerHeight || 900;
    var cols = w >= 900 ? 16 : 8;
    return { cols: cols, rows: Math.max(1, Math.ceil(cols * h / w)) };
  }

  function grid(spec, covered) {
    var C = spec.cols, R = spec.rows, N = C * R;
    var bag = [], i, j, t;
    for (i = 0; i < N; i++) bag.push(i);
    for (i = N - 1; i > 0; i--) { j = (Math.random() * (i + 1)) | 0; t = bag[i]; bag[i] = bag[j]; bag[j] = t; }
    var wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.setAttribute('data-tr', '');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;overflow:hidden;' +
      'grid-template-columns:repeat(' + C + ',1fr);grid-template-rows:repeat(' + R + ',1fr)';
    var cells = [];
    for (i = 0; i < N; i++) {
      var el = document.createElement('i');
      el.style.cssText = 'display:block;transform-origin:center;background:' + spec.color;
      el.style.transform = covered ? 'scale(1.04)' : 'scale(0)';
      el.dataset.delay = Math.round(bag[i] / (N - 1 || 1) * SPREAD);
      cells.push(el); wrap.appendChild(el);
    }
    (document.body || root).appendChild(wrap);
    return { wrap: wrap, cells: cells };
  }

  function play(g, to) {
    g.cells.forEach(function (el) {
      el.style.transition = 'transform ' + DUR + 'ms ' + EASE + ' ' + el.dataset.delay + 'ms';
      el.style.transform = to;
    });
  }

  // ---- Llegada: la página nace cubierta, aguanta y la rejilla se retira ----
  var incoming = null;
  try { incoming = JSON.parse(sessionStorage.getItem(KEY)); sessionStorage.removeItem(KEY); } catch (e) {}
  if (incoming && incoming.cols && !reduce) {
    busy = true;
    var g = grid(incoming, true);
    var retire = function () {
      setTimeout(function () {
        play(g, 'scale(0)');
        setTimeout(function () { g.wrap.remove(); busy = false; }, COVER);
      }, HOLD);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', retire);
    else retire();
  }

  // ---- Salida: la rejilla cubre y, cuando ya no se ve nada, se cambia de página ----
  document.addEventListener('click', function (e) {
    if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin || !/\/$/.test(url.pathname) || /^\/api\//.test(url.pathname)) return;
    if (url.pathname === location.pathname) return;          // ancla dentro de la misma página
    e.preventDefault();
    if (busy) return;
    busy = true;
    var spec = size(); spec.color = COLORS[slugOf(url)] || NARANJA;
    try { sessionStorage.setItem(KEY, JSON.stringify(spec)); } catch (err) {}
    var g = grid(spec, false);
    requestAnimationFrame(function () { requestAnimationFrame(function () { play(g, 'scale(1.04)'); }); });
    setTimeout(function () { location.href = url.href; }, COVER);
  });

  // Al volver con el botón atrás (página guardada en memoria), quitar cualquier resto
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    busy = false;
    try { sessionStorage.removeItem(KEY); } catch (err) {}
    document.querySelectorAll('[data-tr]').forEach(function (n) { n.remove(); });
  });
})();
