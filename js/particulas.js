// 3D particle story for "Qué hacemos". Kept at Àlex's request (9 Oct 2026).
// One engine, several visual VERSIONS of the same five-beat story. In every version the same five things
// (ERP, programas técnicos, hojas de cálculo, correo, WhatsApp) are on screen in every scene:
//   0 opening      the five, each on its own
//   1 Conectar     the five connected, data flowing
//   2 Por capas    what exists stays inside / below, a new layer goes around / above
//   3 Cada persona the company's data in the centre, people around it, one reviews
//   4 Mantener     the connected system keeps beating; something comes round "cada mes"
// Versions, in two families:
//   espacio: A Órbitas (spheres and orbits) · B Cubos (wire cubes) · C Constelación (nodes and threads) · D Galaxias (spirals)
//   tec:     E Circuito (board, traces, layers) · F Señal (waves that fall in step, a heartbeat) · G Matriz (blocks of data, a bus, a scan) · H Engranajes (gears that mesh)
//
// How it works: every dot has a 3D place in every scene, spread at even distances over a shape. A progress value
// (scroll on the home page, buttons in /lab/) moves a target and the animation follows it with damping. Between
// scenes the cloud turns like a slow whirlpool. Depth is shown by dot size (no grey). Paper, ink and accent only.
// The canvas is decorative (aria-hidden): the section's text is real HTML next to it.
(function () {
  var TAU = 6.28318, PI = 3.14159, VW = 100, VH = 72, HEAD = 72;
  // The words drawn on the canvas are written in Spanish below; on a Catalan or an English page they are swapped here.
  var LANG = (document.documentElement.getAttribute('lang') || '').slice(0, 2);
  var WORDS_CA = { 'PROGRAMAS TÉCNICOS': 'PROGRAMES TÈCNICS', 'TÉCNICOS': 'TÈCNICS', 'HOJAS DE CÁLCULO': 'FULLS DE CÀLCUL', 'HOJAS': 'FULLS', 'CORREO': 'CORREU',
    'QUIÉN REVISA': 'QUI REVISA', 'LOS PROGRAMAS ANTIGUOS': 'ELS PROGRAMES ANTICS', 'PANTALLAS NUEVAS': 'PANTALLES NOVES', 'PEDIDOS': 'COMANDES', 'FACTURAS': 'FACTURES', 'TARIFAS': 'TARIFES',
    'LOS DATOS DE LA EMPRESA': 'LES DADES DE L’EMPRESA', 'CADA PERSONA DEL EQUIPO': 'CADA PERSONA DE L’EQUIP', 'POSICIONAMIENTO': 'POSICIONAMENT', 'CONTENIDO': 'CONTINGUT',
    'UNA CONEXIÓN': 'UNA CONNEXIÓ', 'MANTENIMIENTO MENSUAL': 'MANTENIMENT MENSUAL', 'LOS DATOS DE TU EMPRESA': 'LES DADES DE LA TEVA EMPRESA' };
  var WORDS_EN = { 'PROGRAMAS TÉCNICOS': 'TECHNICAL SOFTWARE', 'TÉCNICOS': 'TECHNICAL', 'HOJAS DE CÁLCULO': 'SPREADSHEETS', 'HOJAS': 'SHEETS', 'CORREO': 'EMAIL',
    'QUIÉN REVISA': 'WHO REVIEWS', 'LOS PROGRAMAS ANTIGUOS': 'THE OLD SOFTWARE', 'PANTALLAS NUEVAS': 'NEW SCREENS', 'PEDIDOS': 'ORDERS', 'FACTURAS': 'INVOICES', 'TARIFAS': 'PRICE LISTS',
    'LOS DATOS DE LA EMPRESA': 'THE COMPANY’S DATA', 'CADA PERSONA DEL EQUIPO': 'EACH PERSON ON THE TEAM', 'POSICIONAMIENTO': 'SEARCH RANKING', 'CONTENIDO': 'CONTENT',
    'UNA CONEXIÓN': 'ONE CONNECTION', 'MANTENIMIENTO MENSUAL': 'MONTHLY MAINTENANCE', 'CADA MES': 'EVERY MONTH', 'LOS DATOS DE TU EMPRESA': 'YOUR COMPANY’S DATA', 'UNA PERSONA REVISA': 'A PERSON REVIEWS' };
  var WORDS = LANG === 'en' ? WORDS_EN : LANG === 'ca' ? WORDS_CA : {};
  function word(s) { return WORDS[s] || s; }
  var INK = '#111111', ACCENT = '#ee4b1c', PAPER = '#fafafa';

  // ---------- Shapes (x right · y down · z towards the viewer). Each returns points at even distances ----------
  // o: c colour (1 = accent) · flow speed · g group · wt/k weight (how many dots) · river = width of a stream: the dots of a
  //    flow spread a little sideways and each runs at its own speed, so a trace reads as a river and not as a solid line ·
  //    size = how big its dots are (1 = normal; under 1 = a fine line) · narrow = 0…1, how much of the river's width is
  //    used in this scene (0 = the same dots, same speeds, but in single file: a fine line that can open into a river)
  function ext(p, o) { o = o || {}; p.c = o.c || 0; p.flow = o.flow || 0; p.g = o.g == null ? -1 : o.g; p.river = o.river || 0; p.narrow = o.narrow == null ? 1 : o.narrow; p.size = o.size || 1; if (o.wt) p.wt = o.wt; if (o.k) p.wt *= o.k; return p; }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }
  function lerp3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function hash(j) { var v = Math.sin(j * 12.9898) * 43758.5453; return v - Math.floor(v); }
  function sphere(c, r, o) { return ext({ wt: r * r * 1.15, pt: function (u, j, m) {
    var y = 1 - 2 * (j + 0.5) / m, q = Math.sqrt(1 - y * y), th = j * 2.399963;
    return [c[0] + Math.cos(th) * q * r, c[1] + y * r, c[2] + Math.sin(th) * q * r]; } }, o); }
  function ring(c, r, tx, tz, o) { var cx = Math.cos(tx), sx = Math.sin(tx), cz = Math.cos(tz), sz = Math.sin(tz);
    return ext({ wt: r * 3.4, pt: function (u) {
      var x = Math.cos(u * TAU) * r, z = Math.sin(u * TAU) * r, y1 = -z * sx, z1 = z * cx;
      return [c[0] + x * cz - y1 * sz, c[1] + x * sz + y1 * cz, c[2] + z1]; } }, o); }
  function lat(c, R, deg, o) { var a = deg * PI / 180; return ring([c[0], c[1] + Math.sin(a) * R, c[2]], Math.cos(a) * R, 0, 0, o); }
  function bez(p, q, e, o) { return ext({ wt: dist(p, q) + dist(q, e), p: p, q: q, e: e, pt: function (u) { var m = 1 - u;
    return [m * m * p[0] + 2 * m * u * q[0] + u * u * e[0], m * m * p[1] + 2 * m * u * q[1] + u * u * e[1], m * m * p[2] + 2 * m * u * q[2] + u * u * e[2]]; } }, o); }
  function seg(p, e, o) { return bez(p, lerp3(p, e, 0.5), e, o); }
  var EDGES = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  function cube(c, s, o) { var h = s / 2;                                   // wire cube: 12 edges
    return ext({ wt: 12 * s * 0.6, pt: function (u) { var e = Math.min(11, Math.floor(u * 12)), f = u * 12 - e, a = EDGES[e][0], b = EDGES[e][1];
      var A = [(a & 1 ? h : -h), (a & 2 ? h : -h), (a & 4 ? h : -h)], B = [(b & 1 ? h : -h), (b & 2 ? h : -h), (b & 4 ? h : -h)];
      return [c[0] + A[0] + (B[0] - A[0]) * f, c[1] + A[1] + (B[1] - A[1]) * f, c[2] + A[2] + (B[2] - A[2]) * f]; } }, o); }
  function square(c, h, o) { var K = [[-h, -h], [h, -h], [h, h], [-h, h]];    // flat square outline in the XZ plane
    return ext({ wt: 8 * h * 0.6, pt: function (u) { var e = Math.min(3, Math.floor(u * 4)), f = u * 4 - e, a = K[e], b = K[(e + 1) % 4];
      return [c[0] + a[0] + (b[0] - a[0]) * f, c[1], c[2] + a[1] + (b[1] - a[1]) * f]; } }, o); }
  function spiral(c, R, arms, twist, o) {                                     // a flat galaxy: dense centre, arms that open
    return ext({ wt: R * R * 1.25, pt: function (u, j, m) { var t = (Math.floor(j / arms) + 0.5) / Math.ceil(m / arms), r = R * Math.pow(t, 0.72);
      var a = (j % arms) * TAU / arms + twist * t * TAU + (hash(j) - 0.5) * 0.9 * (1 - t * 0.5), w = (hash(j + 7) - 0.5) * R * 0.16 * (1 - t);
      return [c[0] + Math.cos(a) * r, c[1] + w, c[2] + Math.sin(a) * r]; } }, o); }
  // ---- technical shapes ----
  function elbow(p, q, e, o) { var l1 = dist(p, q), l2 = dist(q, e), sr = l1 / ((l1 + l2) || 1);                 // a trace with one right angle
    var pr = ext({ wt: l1 + l2, p: p, q: q, e: e, lin: 1, sr: sr, pt: function (u) { return u < sr ? lerp3(p, q, u / (sr || 1)) : lerp3(q, e, (u - sr) / ((1 - sr) || 1)); } }, o); return pr; }
  function gridXZ(c, w, d, o) { return ext({ wt: w * d * 0.06, pt: function (u, j, m) { var nx = Math.max(1, Math.round(Math.sqrt(m * w / d))), nz = Math.ceil(m / nx);
    return [c[0] - w / 2 + ((j % nx) + 0.5) / nx * w, c[1], c[2] - d / 2 + (Math.floor(j / nx) + 0.5) / nz * d]; } }, o); }
  function rectXZ(c, w, d, o) { var per = 2 * (w + d);
    return ext({ wt: per * 0.6, pt: function (u) { var t = u * per, x, z; if (t < w) { x = t; z = 0; } else if (t < w + d) { x = w; z = t - w; } else if (t < 2 * w + d) { x = w - (t - w - d); z = d; } else { x = 0; z = d - (t - 2 * w - d); }
      return [c[0] - w / 2 + x, c[1], c[2] - d / 2 + z]; } }, o); }
  function voxel(c, sz, o) { return ext({ wt: sz * sz * sz * 0.055, pt: function (u, j, m) { var n = Math.max(2, Math.ceil(Math.cbrt(m)));        // a block of data: a lattice of dots
    return [c[0] + (((j % n) + 0.5) / n - 0.5) * sz, c[1] + (((Math.floor(j / n) % n) + 0.5) / n - 0.5) * sz, c[2] + (((Math.floor(j / (n * n)) % n) + 0.5) / n - 0.5) * sz]; } }, o); }
  function gear(c, R, teeth, o) { return ext({ wt: R * 6.4, pt: function (u) {                                   // tooth top, flank, root, flank
    var n = Math.floor(u * teeth), f = u * teeth - n, r, fa;
    if (f < 0.36) { r = 1; fa = f / 0.36 * 0.42; } else if (f < 0.5) { r = 1 - (f - 0.36) / 0.14 * 0.2; fa = 0.42 + (f - 0.36) / 0.14 * 0.08; }
    else if (f < 0.86) { r = 0.8; fa = 0.5 + (f - 0.5) / 0.36 * 0.42; } else { r = 0.8 + (f - 0.86) / 0.14 * 0.2; fa = 0.92 + (f - 0.86) / 0.14 * 0.08; }
    var a = (n + fa) / teeth * TAU; return [c[0] + Math.cos(a) * R * r, c[1], c[2] + Math.sin(a) * R * r]; } }, o); }
  function gearIn(c, R, g, col, k) {                                            // hub and four spokes
    var out = [ring(c, R * 0.3, 0, 0, { g: g, c: col, k: (k || 1) * 1.3 }), ring(c, R * 0.72, 0, 0, { g: g, c: col, k: (k || 1) * 0.45 })];
    for (var i = 0; i < 4; i++) { var a = i * TAU / 4; out.push(seg([c[0] + Math.cos(a) * R * 0.3, c[1], c[2] + Math.sin(a) * R * 0.3], [c[0] + Math.cos(a) * R * 0.72, c[1], c[2] + Math.sin(a) * R * 0.72], { g: g, c: col, k: (k || 1) * 0.9 })); }
    return out; }
  function chip(c, sz, g, col) {                                               // a component on a board: body, core and pins
    var h = sz / 2, out = [rectXZ(c, sz, sz, { g: g, c: col, k: 1.7 }), rectXZ(c, sz * 0.5, sz * 0.5, { g: g, c: col, k: 1.1 })];
    [-0.3, 0, 0.3].forEach(function (f) { var d = f * sz;
      out.push(seg([c[0] + d, c[1], c[2] - h], [c[0] + d, c[1], c[2] - h - 1.9], { g: g, c: col, k: 1.5 }), seg([c[0] + d, c[1], c[2] + h], [c[0] + d, c[1], c[2] + h + 1.9], { g: g, c: col, k: 1.5 }),
               seg([c[0] - h, c[1], c[2] + d], [c[0] - h - 1.9, c[1], c[2] + d], { g: g, c: col, k: 1.5 }), seg([c[0] + h, c[1], c[2] + d], [c[0] + h + 1.9, c[1], c[2] + d], { g: g, c: col, k: 1.5 })); });
    return out; }
  function box(c, w, h, d, o) { var hx = w / 2, hz = d / 2;                    // wire box standing on its base centre c, h upwards
    return ext({ wt: 4 * (w + h + d) * 0.6, pt: function (u) { var e = Math.min(11, Math.floor(u * 12)), f = u * 12 - e, a = EDGES[e][0], b = EDGES[e][1];
      var A = [(a & 1 ? hx : -hx), (a & 2 ? 0 : -h), (a & 4 ? hz : -hz)], B = [(b & 1 ? hx : -hx), (b & 2 ? 0 : -h), (b & 4 ? hz : -hz)];
      return [c[0] + A[0] + (B[0] - A[0]) * f, c[1] + A[1] + (B[1] - A[1]) * f, c[2] + A[2] + (B[2] - A[2]) * f]; } }, o); }
  // A trace that keeps its place between scenes: same id + same dots, drawn from `from` to `to` of its length (0…1).
  // When two consecutive scenes have the same route id, the trace GROWS along its path instead of flying across.
  function route(id, pts, from, to, o) { var r = elbow(pts[0], pts[1], pts[2], o); r.rid = id; r.span = [from, to]; return r; }
  function along(pts, t) { var l1 = dist(pts[0], pts[1]), l2 = dist(pts[1], pts[2]), sr = l1 / ((l1 + l2) || 1); return t < sr ? lerp3(pts[0], pts[1], t / (sr || 1)) : lerp3(pts[1], pts[2], (t - sr) / ((1 - sr) || 1)); }
  function flat(list) { return [].concat.apply([], list); }
  function pulseG(c) { return [G(c, 0, { pulse: 0 }), G(c, 0, { pulse: 1 / 3 }), G(c, 0, { pulse: 2 / 3 })]; }

  // A group: how a set of dots moves on its own. w = turn about its centre · tx/tz = tilt · bob = float ·
  // pulse = ring that grows and fades · wave = rides a travelling wave along x · scan = sweeps back and forth on one axis
  function G(c, w, o) { o = o || {}; return { c: c, w: w || 0, bob: o.bob || 0, pulse: o.pulse == null ? null : o.pulse, tx: o.tx || 0, tz: o.tz || 0, wave: o.wave || null, scan: o.scan || null }; }
  function ecg(p) { return -Math.exp(-Math.pow((p - 0.5) / 0.018, 2)) + 0.3 * Math.exp(-Math.pow((p - 0.545) / 0.02, 2)) - 0.12 * Math.exp(-Math.pow((p - 0.4) / 0.05, 2)) - 0.18 * Math.exp(-Math.pow((p - 0.68) / 0.06, 2)); }

  // ---------- Places shared by the versions ----------
  var SCAT = [[-31, -15, 6], [29, -19, -10], [0, 3, 16], [-25, 18, -12], [31, 16, 4]];
  function circle(r, y, a0) { return [0, 1, 2, 3, 4].map(function (i) { var a = i * TAU / 5 + (a0 == null ? -TAU / 4 : a0); return [Math.cos(a) * r, y, Math.sin(a) * r]; }); }
  var PEOPLE = [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { var y = (1 - 2 * (i + 0.5) / 8) * 0.62, q = Math.sqrt(1 - y * y), th = i * 2.399963 + 0.4;
    return [Math.cos(th) * q * 33, y * 33, Math.sin(th) * q * 33]; });
  var REV = 2, O = [0, 0, 0], CORE = [0, 3, 0];
  var PAIRS = []; for (var pa = 0; pa < 5; pa++) for (var pb = pa + 1; pb < 5; pb++) PAIRS.push([pa, pb]);
  function names(N, list, dy, extra) { return list.map(function (c, i) { var l = { t: N[i], p: [c[0], c[1] + dy, c[2]], a: 'center' }; if (extra) for (var k in extra) l[k] = extra[k]; return l; }); }
  function pulses(c, r, first, sq) { return [0, 1, 2].map(function (k) { return (sq ? square(c, r, { c: 1, g: first + k, k: 1.25 }) : ring(c, r, 0, 0, { c: 1, g: first + k, k: 1.25 })); }); }
  var PULSE_G = [G(CORE, 0, { pulse: 0 }), G(CORE, 0, { pulse: 1 / 3 }), G(CORE, 0, { pulse: 2 / 3 })];

  // ---------- The versions ----------
  var VARIANTS = {
    // A · Órbitas: each program is a small planet with its rings
    A: { name: 'Órbitas', group: 0.42, build: function (N) {
      var TILT = [[0.5, 0.3], [-0.4, 0.5], [0.7, -0.2], [0.3, -0.6], [-0.6, -0.3]];
      var W1 = circle(32, 3), W2 = circle(6.2, 0, 0), W3 = [0, 1, 2, 3, 4].map(function (i) { var t = i * TAU / 5 + 0.6; return [Math.cos(t) * 7, (i % 2 ? 2.4 : -2.4), Math.sin(t) * 7]; }), W4 = circle(25, 3);
      return [
        { groups: SCAT.map(function (c, i) { return G(c, (i % 2 ? -1 : 1) * (0.5 + i * 0.09), { bob: 1 }); }),
          a: SCAT.map(function (c, i) { return sphere(c, 8, { g: i }); }),
          b: SCAT.map(function (c, i) { return ring(c, 13, TILT[i][0], TILT[i][1], { g: i, k: 1.6 }); })
            .concat(SCAT.map(function (c, i) { return ring(c, 15.5, TILT[i][0] + 0.5, TILT[i][1] - 0.4, { g: i, k: 0.7 }); }))
            .concat([bez(SCAT[0], [-14, -22, 30], SCAT[2], { flow: 0.03, wt: 4 }), bez(SCAT[2], [18, -6, 30], SCAT[1], { flow: 0.03, wt: 4 }), bez(SCAT[3], [-10, 22, 28], SCAT[2], { flow: 0.03, wt: 4 }), bez(SCAT[2], [20, 22, 30], SCAT[4], { flow: 0.03, wt: 4 })]),
          labels: names(N, SCAT, -12.5), spin: 0.05 },
        { groups: W1.map(function (c) { return G(c, 0.5); }).concat([G(CORE, -0.7)]),
          a: W1.map(function (c, i) { return sphere(c, 5.2, { g: i }); }),
          b: [ring(CORE, 32, 0, 0, { k: 0.8 }), sphere(CORE, 7, { c: 1, g: 5, k: 2.2 }), ring(CORE, 11, 0, 0, { c: 1, k: 1.1 })]
            .concat(W1.map(function (c) { return bez(c, [c[0] * 0.5, -17, c[2] * 0.5], [c[0] * 0.2, 0, c[2] * 0.2], { c: 1, flow: 0.2, k: 1.5 }); })),
          labels: names(N, W1, -8), spin: 0.16 },
        { groups: W2.map(function (c) { return G(c, 0.6); }).concat([G(O, 0.22), G(O, -0.3)]),
          a: W2.map(function (c, i) { return sphere(c, 4.3, { g: i }); }),
          b: [sphere(O, 17, { g: 5, k: 0.42 })].concat([-60, -36, -12, 12, 36, 60].map(function (d) { return lat(O, 28, d, { c: 1, g: 6, k: 1.15 }); }))
            .concat([ring(O, 28, PI / 2, 0, { c: 1, g: 6, k: 0.8 }), ring(O, 28, PI / 2, PI / 2, { c: 1, g: 6, k: 0.8 })]),
          labels: [{ t: 'LO VIEJO', p: [0, 34, 0], a: 'center', fixed: true }, { t: 'UNA PANTALLA MÁS CLARA', p: [0, -33, 0], a: 'center', c: 1, fixed: true }], spin: 0.1 },
        { groups: W3.map(function () { return G(O, 0.3); }),
          a: W3.map(function (c, i) { return sphere(c, 5.4, { g: i }); }),
          b: PEOPLE.map(function (p) { return sphere(p, 2.9, { k: 3.2 }); })
            .concat(PEOPLE.map(function (p) { return seg(lerp3(O, p, 0.36), lerp3(O, p, 0.9), { c: 1, flow: 0.22, k: 1.15 }); }))
            .concat([ring(PEOPLE[REV], 5.6, 0.5, 0.3, { c: 1, k: 2.2 }), ring(O, 33, 0.35, 0.2, { k: 0.35 }), ring(O, 33, -0.5, -0.3, { k: 0.35 })]),
          labels: [{ t: 'LOS DATOS DE TU EMPRESA', p: [0, 15.5, 0], a: 'center' }, { t: 'UNA PERSONA REVISA', p: [PEOPLE[REV][0], PEOPLE[REV][1] - 7.5, PEOPLE[REV][2]], a: 'center', c: 1 }], spin: 0.14 },
        { groups: W4.map(function (c) { return G(c, 0.5); }).concat([G(CORE, -0.7)], PULSE_G, [G(CORE, 0.55)]),
          a: W4.map(function (c, i) { return sphere(c, 4.8, { g: i }); }),
          b: [sphere(CORE, 6.5, { c: 1, g: 5, k: 2.2 }), ring(CORE, 25, 0, 0, { k: 0.7 })]
            .concat(W4.map(function (c) { return bez(c, [c[0] * 0.5, -9, c[2] * 0.5], [c[0] * 0.24, 1, c[2] * 0.24], { c: 1, flow: 0.2, k: 1.1 }); }))
            .concat(pulses(CORE, 46, 6), [ring([0, -5, 0], 39, 0, 0, { k: 0.5 }), sphere([39, -5, 0], 2.7, { c: 1, g: 9, k: 4 })]),
          labels: names(N, W4, -7.5).concat([{ t: 'CADA MES', p: [39, -11, 0], a: 'center', c: 1, g: 9 }]), spin: 0.12 }
      ]; } },

    // B · Cubos: each program is a block. They tumble apart, line up, get boxed in a new frame, and keep beating
    B: { name: 'Cubos', group: 0.4, build: function (N) {
      var TILT = [[0.6, 0.4], [-0.5, 0.7], [0.9, -0.3], [0.4, -0.8], [-0.7, -0.4]];
      var W1 = circle(32, 3), BLOCK = [[-5.2, -5.2, -5.2], [5.2, 5.2, -5.2], [5.2, -5.2, 5.2], [-5.2, 5.2, 5.2], [0, 0, 0]], W4 = circle(25, 3);
      return [
        { groups: SCAT.map(function (c, i) { return G(c, (i % 2 ? -1 : 1) * (0.45 + i * 0.08), { bob: 1, tx: TILT[i][0], tz: TILT[i][1] }); }),
          a: SCAT.map(function (c, i) { return cube(c, 13, { g: i }); }),
          b: SCAT.map(function (c, i) { return cube(c, 6, { g: i, k: 1.6 }); })
            .concat(SCAT.map(function (c, i) { return cube(c, 19, { g: i, k: 0.32 }); })),
          labels: names(N, SCAT, -13.5), spin: 0.05 },
        { groups: W1.map(function (c) { return G(c, 0.4); }).concat([G(CORE, -0.6)]),
          a: W1.map(function (c, i) { return cube(c, 9, { g: i }); }),
          b: [cube(CORE, 12, { c: 1, g: 5, k: 2 }), cube(CORE, 5, { c: 1, g: 5, k: 1.6 })]
            .concat(W1.map(function (c) { return seg(c, lerp3(c, CORE, 0.8), { c: 1, flow: 0.24, k: 1.5 }); }))
            .concat(W1.map(function (c, i) { return seg(c, W1[(i + 1) % 5], { k: 0.5 }); })),
          labels: names(N, W1, -8.5), spin: 0.16 },
        { groups: BLOCK.map(function () { return G(O, 0.3); }).concat([G(O, 0.3), G(O, -0.22, { tx: 0.25 })]),
          a: BLOCK.map(function (c, i) { return cube(c, 8.4, { g: i }); }),
          b: [cube(O, 24, { g: 5, k: 0.55 }), cube(O, 38, { c: 1, g: 6, k: 1.5 }), cube(O, 41.5, { c: 1, g: 6, k: 0.5 })],
          labels: [{ t: 'LO VIEJO', p: [0, 31, 0], a: 'center', fixed: true }, { t: 'UNA PANTALLA MÁS CLARA', p: [0, -31, 0], a: 'center', c: 1, fixed: true }], spin: 0.08 },
        { groups: BLOCK.map(function () { return G(O, 0.3); }),
          a: BLOCK.map(function (c, i) { return cube(c, 8.4, { g: i }); }),
          b: PEOPLE.map(function (p) { return cube(p, 4.6, { k: 2.4 }); })
            .concat(PEOPLE.map(function (p) { return seg(lerp3(O, p, 0.34), lerp3(O, p, 0.88), { c: 1, flow: 0.22, k: 1.15 }); }))
            .concat([cube(PEOPLE[REV], 9, { c: 1, k: 1.7 }), ring(O, 33, 0.35, 0.2, { k: 0.3 })]),
          labels: [{ t: 'LOS DATOS DE TU EMPRESA', p: [0, 15, 0], a: 'center' }, { t: 'UNA PERSONA REVISA', p: [PEOPLE[REV][0], PEOPLE[REV][1] - 8.5, PEOPLE[REV][2]], a: 'center', c: 1 }], spin: 0.14 },
        { groups: W4.map(function (c) { return G(c, 0.4); }).concat([G(CORE, -0.6)], PULSE_G, [G(CORE, 0.55)]),
          a: W4.map(function (c, i) { return cube(c, 7.6, { g: i }); }),
          b: [cube(CORE, 10, { c: 1, g: 5, k: 2 })]
            .concat(W4.map(function (c) { return seg(c, lerp3(c, CORE, 0.78), { c: 1, flow: 0.22, k: 1.2 }); }))
            .concat(W4.map(function (c, i) { return seg(c, W4[(i + 1) % 5], { k: 0.5 }); }))
            .concat(pulses(CORE, 40, 6, true), [ring([0, -5, 0], 39, 0, 0, { k: 0.45 }), cube([39, -5, 0], 4.6, { c: 1, g: 9, k: 3 })]),
          labels: names(N, W4, -7.5).concat([{ t: 'CADA MES', p: [39, -11, 0], a: 'center', c: 1, g: 9 }]), spin: 0.12 }
      ]; } },

    // C · Constelación: small points of light and the threads between them. The story is told by the lines
    C: { name: 'Constelación', group: 0.26, build: function (N) {
      var P1 = circle(31, 2), P2 = circle(21, 17), P3 = circle(9, 9), P4 = circle(27, 3);
      var LOOSE = [[9, -7, 4], [-8, 5, 7], [4, 9, -8]];                           // three loose ends on every point
      var mesh = function (pts, o) { return PAIRS.map(function (q) { return seg(pts[q[0]], pts[q[1]], o); }); };
      var node = function (pts, r) { return pts.map(function (c, i) { return sphere(c, r, { g: i }); }); };
      var halo = function (pts, r, k) { return pts.map(function (c, i) { return ring(c, r, 0.9, 0.3 + i, { g: i, k: k || 1 }); }); };
      var PPL = [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { var a = i * TAU / 8 + 0.3; return [Math.cos(a) * 35, -9, Math.sin(a) * 35]; });
      return [
        { groups: SCAT.map(function (c, i) { return G(c, (i % 2 ? -0.7 : 0.7), { bob: 1 }); }),
          a: node(SCAT, 3.6),
          b: halo(SCAT, 6.5, 1.3).concat(SCAT.reduce(function (acc, c, i) { return acc.concat(LOOSE.map(function (d, k) { var s = (i + k) % 2 ? 1 : -1;
            return seg(c, [c[0] + d[0] * s * 1.5, c[1] + d[1] * 1.5, c[2] + d[2] * s * 1.5], { g: i, k: 1.1 }); })); }, [])),
          labels: names(N, SCAT, -9.5), spin: 0.06 },
        { groups: P1.map(function (c) { return G(c, 0.7); }),
          a: node(P1, 3.6),
          b: halo(P1, 6.5, 0.9).concat(mesh(P1, { c: 1, flow: 0.16 })),
          labels: names(N, P1, -9), spin: 0.18 },
        { groups: P2.map(function (c) { return G(c, 0.7); }).concat([G(O, -0.25)]),
          a: node(P2, 3.2),
          b: P2.map(function (c, i) { return seg(c, P2[(i + 1) % 5], { k: 0.9 }); })                                   // the old net, kept at the bottom
            .concat([ring([0, 17, 0], 27, 0, 0, { k: 0.5 }), ring([0, 0, 0], 27, 0, 0, { k: 0.7 }), ring([0, 0, 0], 18, 0, 0, { k: 0.6 })])
            .concat([ring([0, -17, 0], 27, 0, 0, { c: 1, g: 5, k: 1.3 }), ring([0, -17, 0], 18, 0, 0, { c: 1, g: 5, k: 1.2 }), ring([0, -17, 0], 9, 0, 0, { c: 1, g: 5, k: 1.2 })])
            .concat(circle(27, 17).map(function (c) { return seg(c, [c[0], -17, c[2]], { k: 0.42 }); })),
          labels: [{ t: 'LO VIEJO', p: [0, 26, 0], a: 'center', fixed: true }, { t: 'UNA PANTALLA MÁS CLARA', p: [0, -27, 0], a: 'center', c: 1, fixed: true }], spin: 0.1 },
        { groups: P3.map(function () { return G([0, 9, 0], 0.4); }),
          a: node(P3, 3.4),
          b: mesh(P3, { k: 0.7, g: 0 }).concat(PPL.map(function (p) { return sphere(p, 2.3, { k: 3 }); }))
            .concat(PPL.map(function (p) { return bez([0, 9, 0], [p[0] * 0.5, -16, p[2] * 0.5], p, { c: 1, flow: 0.2, k: 0.85 }); }))
            .concat([ring([0, -9, 0], 35, 0, 0, { k: 0.4 }), ring(PPL[REV], 5, 0.6, 0.2, { c: 1, k: 2.2 })]),
          labels: [{ t: 'LOS DATOS DE TU EMPRESA', p: [0, 21, 0], a: 'center' }, { t: 'UNA PERSONA REVISA', p: [PPL[REV][0], PPL[REV][1] - 7, PPL[REV][2]], a: 'center', c: 1 }], spin: 0.14 },
        { groups: P4.map(function (c) { return G(c, 0.7); }).concat([G(CORE, 0)], PULSE_G, [G(CORE, 0.55)]),
          a: node(P4, 3.6),
          b: halo(P4, 6.5, 0.8).concat(mesh(P4, { c: 1, flow: 0.16, k: 0.9 })).concat(pulses(CORE, 46, 6), [ring([0, -5, 0], 40, 0, 0, { k: 0.45 }), sphere([40, -5, 0], 2.6, { c: 1, g: 9, k: 4 })]),
          labels: names(N, P4, -9).concat([{ t: 'CADA MES', p: [40, -11, 0], a: 'center', c: 1, g: 9 }]), spin: 0.12 }
      ]; } },

    // D · Galaxias: each program is a small spiral of dots. They pour into one, stack in levels, and keep turning
    D: { name: 'Galaxias', group: 0.46, build: function (N) {
      var TILT = [[0.7, 0.3], [-0.5, 0.6], [0.35, -0.2], [0.9, -0.5], [-0.8, -0.3]];
      var W1 = circle(33, 3), W2 = circle(10, 17, 0.3), W3 = circle(8, 0, 0.6), W4 = circle(26, 3);
      var inflow = function (pts, k) { return pts.map(function (c) { return bez(c, [c[0] * 0.55 - c[2] * 0.5, -6, c[2] * 0.55 + c[0] * 0.5], [c[0] * 0.12, CORE[1], c[2] * 0.12], { c: 1, flow: 0.2, k: k }); }); };
      return [
        { groups: SCAT.map(function (c, i) { return G(c, (i % 2 ? -1 : 1) * (0.5 + i * 0.07), { bob: 1, tx: TILT[i][0], tz: TILT[i][1] }); }),
          a: SCAT.map(function (c, i) { return spiral(c, 12, 3, 0.9, { g: i }); }),
          b: SCAT.map(function (c, i) { return ring(c, 14.5, 0, 0, { g: i, k: 0.8 }); }),
          labels: names(N, SCAT, -13), spin: 0.05 },
        { groups: W1.map(function (c, i) { return G(c, 0.9, { tx: 0.15 * (i % 2 ? 1 : -1) }); }).concat([G(CORE, -1.1)]),
          a: W1.map(function (c, i) { return spiral(c, 7.2, 3, 0.9, { g: i }); }),
          b: [spiral(CORE, 13, 4, 1.1, { c: 1, g: 5, k: 1.5 })].concat(inflow(W1, 1.5)),
          labels: names(N, W1, -8.5), spin: 0.16 },
        { groups: W2.map(function (c) { return G(c, 1); }).concat([G([0, 0, 0], 0.5), G([0, -17, 0], -0.7)]),
          a: W2.map(function (c, i) { return spiral(c, 5.6, 2, 0.8, { g: i }); }),
          b: [ring([0, 17, 0], 22, 0, 0, { k: 0.6 }), spiral([0, 0, 0], 21, 4, 0.8, { g: 5, k: 0.42 }), spiral([0, -17, 0], 26, 5, 1.1, { c: 1, g: 6, k: 0.62 }), ring([0, -17, 0], 27.5, 0, 0, { c: 1, k: 0.9 }), seg([0, 22, 0], [0, -22, 0], { k: 0.5 })],
          labels: [{ t: 'LO VIEJO', p: [0, 27, 0], a: 'center', fixed: true }, { t: 'UNA PANTALLA MÁS CLARA', p: [0, -27, 0], a: 'center', c: 1, fixed: true }], spin: 0.1 },
        { groups: W3.map(function () { return G(O, 0.6); }).concat(PEOPLE.map(function (p, i) { return G(p, (i % 2 ? -1.2 : 1.2), { tx: 0.5 + i * 0.3, tz: 0.3 }); })),
          a: W3.map(function (c, i) { return spiral(c, 6.4, 2, 0.8, { g: i }); }),
          b: PEOPLE.map(function (p, i) { return spiral(p, 3.6, 2, 0.7, { g: 5 + i, k: 2.2 }); })
            .concat(PEOPLE.map(function (p) { return seg(lerp3(O, p, 0.4), lerp3(O, p, 0.88), { c: 1, flow: 0.22, k: 1.1 }); }))
            .concat([ring(PEOPLE[REV], 6, 0.5, 0.3, { c: 1, k: 2.2 }), ring(O, 33, 0.35, 0.2, { k: 0.3 })]),
          labels: [{ t: 'LOS DATOS DE TU EMPRESA', p: [0, 15.5, 0], a: 'center' }, { t: 'UNA PERSONA REVISA', p: [PEOPLE[REV][0], PEOPLE[REV][1] - 8, PEOPLE[REV][2]], a: 'center', c: 1 }], spin: 0.14 },
        { groups: W4.map(function (c) { return G(c, 0.9); }).concat([G(CORE, -1.1)], PULSE_G, [G(CORE, 0.55)]),
          a: W4.map(function (c, i) { return spiral(c, 6.6, 3, 0.9, { g: i }); }),
          b: [spiral(CORE, 9.5, 4, 1.1, { c: 1, g: 5, k: 1.6 })].concat(inflow(W4, 1.1)).concat(pulses(CORE, 46, 6), [ring([0, -5, 0], 40, 0, 0, { k: 0.45 }), spiral([40, -5, 0], 3.4, 2, 0.7, { c: 1, g: 9, k: 4 })]),
          labels: names(N, W4, -8).concat([{ t: 'CADA MES', p: [40, -11, 0], a: 'center', c: 1, g: 9 }]), spin: 0.12 }
      ]; } },

    // ================= Technical family =================
    // E · Circuito (the version Àlex chose): the five are components on a board. EIGHT scenes, one per line of the
    // home copy (content package of 10 Oct, decision W28: the catalogue of services, from the widest to the most
    // concrete, maintenance with all). Each scene has a `key`; the caption that wants it names it (Story.astro):
    //   start     what there is: five programs on a board, not plugged in
    //   plan      strategy and whole system: the drawing, as fine lines, with a ring where a person reviews
    //   software  made-to-measure software: the lines open into rivers, the processor arrives, three layers rise
    //   docs      processes and documents: orders, invoices and price lists come in from outside
    //   people    consult, write and analyse: the data goes up to a layer where each person has their own frame
    //   marketing marketing and content: from the system outwards, three pages
    //   task      one concrete task: everything folds away except one connection
    //   upkeep    monthly maintenance: a round trip from component to component, each one checked in turn
    // RULE OF THIS VERSION: nothing flies away and nothing appears from nowhere. Every scene is the previous one plus
    // something that GROWS out of it (or minus something that thins out along its own path).
    // To make that possible the board, the plots, the processor and EVERY trace of the story are "pinned": the same dots in all
    // scenes. A trace that does not exist yet has no length (and is invisible); when its scene comes, it grows.
    // The few free dots are the fine grid of the board: it lifts to become the grid of the layers, gathers into the
    // people, and comes back down for the last scenes. They only ever move up or down, never across.
    // Look: only the main traces (and what carries data) are rivers; every other line is a fine, sharp line.
    // Colour: orange is what THIS step adds, plus the small rings on each trace: the point where a person reviews.
    // Camera: start and plan from above · software, docs and people from low and to one side, so the layers are seen
    // stacked (the angle Àlex chose by turning the drawing himself) · the last three straight on, like a diagnostic screen.
    E: { name: 'Circuito', set: 'tec', dots: 1.25, group: 0.2, pinned: 0.62, calm: true, coherent: true, coherentA: true, lift: -3, turn: 0, yaw: -0.3, sway: 0.035, focal: 300, zoom: 0.86, dy: 4, build: function (N) {
      var BY = 1, RX = -1.0, GAP = 14, FLOW = 0.2;               // negative tilt = looking down at the board; -1.57 would be straight down
      var LYS = [BY - GAP, BY - 2 * GAP, BY - 3 * GAP], TOP = LYS[2];                    // three layers above the board (up is negative y)
      var C1 = [[-30, BY, -15], [-30, BY, 15], [0, BY, -25], [30, BY, -15], [30, BY, 15]], CPU = [0, BY, 3];
      var flatXZ = function (r) { return r.map(function (q) { return [q[0], BY, q[1]]; }); };
      // from a component to the processor: out of its side, one right angle, into the processor
      var PATH = C1.map(function (c) {
        if (c[0] === 0) return [[0, BY, c[2] + 5.5], [0, BY, (c[2] + 5.5 + CPU[2] - 7) / 2], [0, BY, CPU[2] - 7]];
        var sx = c[0] < 0 ? 1 : -1, tz = c[2] < CPU[2] ? CPU[2] - 7 : CPU[2] + 7;
        return [[c[0] + sx * 5.5, BY, c[2]], [-sx * 4, BY, c[2]], [-sx * 4, BY, tz]]; });
      var MID = PATH.map(function (pts) { return along(pts, 0.5); });
      var up = function (c) { return [[c[0], BY, c[2]], [c[0], (BY + TOP) / 2, c[2]], [c[0], TOP, c[2]]]; };
      var VIA = C1.map(up), HUB = up(CPU), J = HUB[2];           // straight up through the layers; the processor's one carries the data
      // each layer is a board of the same size; its outline is drawn from the far corner, down both sides
      var LAYER = flat(LYS.map(function (y) { var a = [-46, y, -33], b = [46, y, -33], c = [46, y, 33], d = [-46, y, 33]; return [[a, b, c], [a, d, c]]; }));
      // six people on the top layer: a bus across, then a fine trace to each. A person is a circle, and EVERY one is marked in
      // orange, inside a small frame of their own: the layer is made to measure for each person (Àlex: "señala todas").
      var T = [[-30, -14], [0, -14], [30, -14], [-30, 20], [0, 20], [30, 20]].map(function (q) { return [q[0], TOP, q[1]]; }), PR = 3;
      var PERS = T.map(function (p) { var e = [p[0], TOP, p[2] + (p[2] < J[2] ? PR : -PR)]; return p[0] ? [J, [p[0], TOP, J[2]], e] : [J, [0, TOP, (J[2] + e[2]) / 2], e]; });
      // documents that come in from outside the board: an order, an invoice, a price list
      var INBOX = [[[56, 15], [46, 15], [35.5, 15]], [[56, -15], [46, -15], [35.5, -15]], [[0, -43], [0, -37], [0, -30.5]]].map(flatXZ);
      var DOCS = [[59.5, 15], [59.5, -15], [0, -46.8]];
      // from the processor outwards: a trunk between two components, then one branch to each page
      var PAGES = [[57, -19], [57, 3], [57, 25]];
      var OUT = PAGES.map(function (q) { return flatXZ(q[1] === 3 ? [[7, 3], [29, 3], [51, 3]] : [[7, 3], [46, 3], [46, q[1]]]); });   // the branches turn before the pages, so they are not hidden under their edges
      // the round trip of every month: from component to component and back to the first
      var LOOP = [[[-30, -20.5], [-30, -25], [-5.5, -25]], [[5.5, -25], [30, -25], [30, -20.5]], [[30, -9.5], [30, 0], [30, 9.5]],
                  [[30, 20.5], [30, 26], [0, 26]], [[0, 26], [-30, 26], [-30, 20.5]], [[-30, 9.5], [-30, 0], [-30, -9.5]]].map(flatXZ);
      var PHASE = [0, 0.2, 0.8, 0.6, 0.4];                       // the check goes round in the same order as the trip
      var STUB = 0.3, OFF = [0, 0], ON = [0, 1], none = function () { return OFF; }, every = function () { return ON; };
      var chips = function (lift) { return flat(C1.map(function (c, i) { return chip([c[0], c[1] - (lift || 0), c[2]], 11, i, 0); })); };
      var loose = function (i) { return [C1[i], 21, 21]; }, seated = function (i) { return [C1[i], 15.5, 15.5]; };
      // the processor: the same dots in every scene. As an empty socket its pins are pulled in (same dots, no length).
      var cpu = function (col, socket) { return chip(CPU, 14, 5, col).map(function (q, i) { q.wt *= 2.1; if (!socket || i < 2) return q;   // heavier than a component: it is the piece that matters
        var z = seg(q.p, q.p, { g: 5, c: col }); z.wt = q.wt; return z; }); };
      // a small ring on each trace: first the loose end of an unplugged cable; from the design on, the point where a person reviews (orange)
      var rings = function (col, r, where) { return PATH.map(function (pts, i) { return ring(where ? where(i) : MID[i], r, 0, 0, { c: col, wt: 21 }); }); };
      var fine = function (k) { return gridXZ([0, BY, 0], 88, 62, { k: k, size: 0.7 }); };                                 // the fine grid of the board
      // the marks of a drawing at the four corners of the system (plan)
      var marks = flat([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { var x = q[0] * 50, z = q[1] * 37;
        return [seg([x, BY, z], [x - q[0] * 9, BY, z], { k: 2.2 }), seg([x, BY, z], [x, BY, z - q[1] * 9], { k: 2.2 })]; }));
      // a sheet of paper: an outline and two lines of text
      var sheet = function (q, w, d, col, lines) { var out = [rectXZ([q[0], BY, q[1]], w, d, { c: col, k: 2 })];
        for (var l = 0; l < lines; l++) { var z = q[1] - d / 2 + d * (l + 1) / (lines + 1); out.push(seg([q[0] - w * 0.3, BY, z], [q[0] + w * (l === lines - 1 ? 0.05 : 0.3), BY, z], { c: col, k: 2 })); }
        return out; };
      var docs = function (col) { return flat(DOCS.map(function (q) { return sheet(q, 7, 8.5, col, 2); })); };
      // st: trace(i) / layer(i) = [from, to] of each one · via/hub/pers/inbox/out/loop = [from, to] of each family · tc, ic = colour of
      //     the five traces and of what comes in · plan = true while they are only a drawing (fine line, single file) ·
      //     cpu = colour of the processor · plot(i) = [centre, w, d]
      var pinned = function (st) { return [rectXZ([0, BY, 0], 92, 66, { k: 0.7 })].concat(cpu(st.cpu, st.socket))
        .concat(PATH.map(function (pts, i) { var sp = st.trace(i); return route(1 + i, pts, sp[0], sp[1], { c: st.tc, flow: FLOW, k: 1.25, river: 1.7, narrow: st.plan ? 0 : 1, size: st.plan ? 0.62 : 1 }); }))
        .concat(C1.map(function (c, i) { var q = st.plot(i); return rectXZ(q[0], q[1], q[2], { wt: 26 }); }))
        .concat(VIA.map(function (pts, i) { return route(6 + i, pts, st.via[0], st.via[1], { c: 1, flow: 0.25, k: 0.5, size: 0.62 }); }))
        .concat(LAYER.map(function (pts, i) { var sp = st.layer(i >> 1); return route(11 + i, pts, sp[0], sp[1], { c: 1, flow: 0.05, k: 0.42, size: 0.7 }); }))
        .concat([route(17, HUB, st.hub[0], st.hub[1], { c: 1, flow: 0.3, k: 1.1, river: 0.5 })])
        .concat(PERS.map(function (pts, i) { return route(18 + i, pts, st.pers[0], st.pers[1], { c: 1, flow: 0.22, k: 0.85, size: 0.62 }); }))
        .concat(LOOP.map(function (pts, i) { return route(24 + i, pts, st.loop[0], st.loop[1], { c: 1, flow: 0.2, k: 1.15, river: 0.9 }); }))
        .concat(INBOX.map(function (pts, i) { return route(30 + i, pts, st.inbox[0], st.inbox[1], { c: st.ic, flow: 0.3, k: 1.5, river: 1.2 }); }))
        .concat(OUT.map(function (pts, i) { return route(33 + i, pts, st.out[0], st.out[1], { c: 1, flow: 0.24, k: 0.7, river: 0.9 }); })); };
      var base = { trace: every, tc: 0, cpu: 0, plot: seated, via: OFF, layer: none, hub: OFF, pers: OFF, loop: OFF, inbox: OFF, ic: 1, out: OFF };
      var S = function (o) { var st = {}, k; for (k in base) st[k] = base[k]; for (k in o) st[k] = o[k]; return pinned(st); };
      var grid = function (y, k) { return gridXZ([0, y, 0], 88, 62, { c: 1, k: k, size: 0.8 }); };
      var people = T.map(function (p) { return ring(p, PR, 0, 0, { c: 1, k: 2.4 }); }).concat(T.map(function (p) { return rectXZ(p, 15, 12, { c: 1, k: 0.9 }); }));
      var floating = C1.map(function (c) { return G(c, 0, { bob: 0.55 }); }).concat([G(CPU, 0)]);
      var board = C1.map(function (c) { return G(c, 0); }).concat([G(CPU, 0)]);
      var SIDE = { rx: -0.42, yaw: -0.95, dy: 10, zoom: 0.8 }, FRONT = { rx: -1.5, yaw: 0, dy: -3, zoom: 0.92 };
      var cam = function (c, sc) { for (var k in c) if (sc[k] == null) sc[k] = c[k]; sc.spin = 0; return sc; };
      var below = function (q, d) { return [q[0] + 0.825 * d, BY, q[1] + 0.565 * d]; };                                  // d units further down the screen, in the side view
      return [
        // start · five components on the same board, each in its own plot, not plugged in. Their traces set off towards
        //   the centre and stop (a loose end). In the centre, an empty socket: the piece that is missing.
        { key: 'start', rx: RX, groups: floating, spin: 0,
          a: chips(3),
          r: S({ trace: function () { return [0, STUB]; }, socket: true, plot: loose }),
          b: rings(0, 1.3, function (i) { return along(PATH[i], STUB); }).concat([fine(1.35)]),
          labels: names(N, C1, -9.5) },
        // plan · nothing is plugged in yet: it is the drawing. The traces are drawn whole, as fine lines (what connects
        //   to what); on each one, an orange ring marks where a person reviews; four corner marks frame the system.
        { key: 'plan', rx: RX, groups: floating, spin: 0,
          a: chips(3),
          r: S({ plan: true, socket: true, plot: loose }),
          b: rings(1, 1.7).concat([fine(1)], marks),
          labels: names(N, C1, -9.5).concat([{ t: 'QUIÉN REVISA', p: [MID[3][0], BY, MID[3][2] + 6], a: 'center', c: 1 }]) },
        // software · the eye comes down to one side. The drawn lines open into rivers of data, the components land and
        //   the socket becomes the processor; from each component a via grows upwards and three layers draw themselves:
        //   what is built on top of the programs the company already has.
        cam(SIDE, { key: 'software', groups: board,
          a: chips(),
          r: S({ tc: 1, cpu: 1, via: ON, layer: every }),
          b: rings(1, 1.7).concat([grid(LYS[0], 0.25), grid(LYS[1], 0.25), grid(TOP, 0.8)]),
          labels: [{ t: 'LOS PROGRAMAS ANTIGUOS', p: [51, BY, 37], a: 'center' }, { t: 'PANTALLAS NUEVAS', p: [-51, TOP, -37], a: 'center', c: 1 }] }),
        // docs · everything stays. Three sheets come in from outside the board (an order, an invoice, a price list) and
        //   reach the program they belong to; what was orange goes back to black.
        cam(SIDE, { key: 'docs', groups: board,
          a: chips(),
          r: S({ via: ON, layer: every, inbox: ON }),
          b: rings(1, 1.7).concat([grid(LYS[0], 0.2), grid(LYS[1], 0.2), grid(TOP, 0.6)], docs(1)),
          labels: [{ t: 'PEDIDOS', p: below(DOCS[0], 8), a: 'center', c: 1 }, { t: 'FACTURAS', p: below(DOCS[1], 8), a: 'center', c: 1 }, { t: 'TARIFAS', p: below(DOCS[2], -8), a: 'center', c: 1 }] }),
        // people · the data goes up from the processor to the top layer, runs along a bus and a fine trace grows to each
        //   person. Every person is marked, each in a frame of their own.
        cam(SIDE, { key: 'people', groups: board,
          a: chips(),
          r: S({ via: ON, layer: every, inbox: ON, ic: 0, hub: ON, pers: ON }),
          b: rings(1, 1.7).concat([grid(TOP, 0.4)], docs(0), people),
          labels: [{ t: 'LOS DATOS DE LA EMPRESA', p: [51, BY, 37], a: 'center' }, { t: 'CADA PERSONA DEL EQUIPO', p: [-51, TOP, -37], a: 'center', c: 1 }] }),
        // marketing · seen straight on. The layers fold away and the system is left; from the processor a trunk goes
        //   out between two components and reaches three pages outside the board, each one sending out its signal.
        cam(FRONT, { key: 'marketing', zoom: 0.78, dx: -7, groups: board.concat(PAGES.map(function (q, i) { return G([q[0], BY, q[1]], 0, { pulse: i / 3 }); })),
          a: chips(),
          r: S({ out: ON }),
          b: rings(1, 1.7).concat([fine(0.8)], flat(PAGES.map(function (q) { return sheet(q, 12, 15, 1, 3).concat(q[1] === 3 ? [] : [seg([46, BY, q[1]], [51, BY, q[1]], { c: 1, k: 2.4 })]); })),
            PAGES.map(function (q, i) { return square([q[0], BY, q[1]], 11, { c: 1, g: 6 + i, k: 0.8 }); })),
          labels: [{ t: 'WEB', p: [PAGES[0][0], BY, PAGES[0][1] - 10], a: 'center', c: 1 }, { t: 'POSICIONAMIENTO', p: [PAGES[1][0], BY, PAGES[1][1] - 10], a: 'center', c: 1 }, { t: 'CONTENIDO', p: [PAGES[2][0], BY, PAGES[2][1] - 10], a: 'center', c: 1 }] }),
        // task · the smallest service: everything else thins out and ONE connection is left, with its review ring.
        cam(FRONT, { key: 'task', groups: board,
          a: chips(),
          r: S({ trace: function (i) { return i === 0 ? ON : OFF; }, tc: 1 }),
          b: rings(1, 1.7, function () { return MID[0]; }).concat([fine(1.3)]),
          labels: C1.map(function (c, i) { return { t: N[i], p: [c[0], BY, c[2] - 10.5], a: 'center' }; }).concat([{ t: 'UNA CONEXIÓN', p: [MID[0][0] + 4, BY, MID[0][2] + 6], a: 'center', c: 1 }]) }),
        // upkeep · monthly maintenance. Every trace is back, running (orange again). A round trip grows from component to
        //   component and each one is checked in turn (a square that opens around it).
        cam(FRONT, { key: 'upkeep', groups: board.concat(C1.map(function (c, i) { return G(c, 0, { pulse: PHASE[i] }); })),
          a: chips(),
          r: S({ tc: 1, cpu: 1, loop: ON }),
          b: rings(1, 1.7).concat([fine(1)]).concat(C1.map(function (c, i) { return square(c, 9.6, { c: 1, g: 6 + i, k: 1.1 }); })),
          labels: [{ t: 'MANTENIMIENTO MENSUAL', p: [0, BY, -38], a: 'center', c: 1 }] })
      ]; } },

    // F · Señal: each program is a signal. Out of step and noisy; then in step; then clean; and at the end, a heartbeat
    F: { name: 'Señal', set: 'tec', group: 0.42, turn: 0.07, zoom: 0.86, build: function (N) {
      var RX = 0.42, X0 = -42, X1 = 42;
      var Y = [0, 1, 2, 3, 4].map(function (i) { return (i - 2) * 7; }), Z = [0, 1, 2, 3, 4].map(function (i) { return -(i - 2) * 9; });
      var AMP = [7, 5, 8, 4.5, 6], KK = [0.16, 0.34, 0.23, 0.5, 0.28], SP = [1.6, -2.4, 2, -3.1, 2.7];
      var SYNC = { amp: 4.6, k: 0.2, speed: 2.2, phase: 0 };
      var lines = function (ys, zs, x0, x1, off) { return ys.map(function (y, i) { return seg([x0, y, zs[i]], [x1, y, zs[i]], { g: (off || 0) + i }); }); };
      var PPL = [0, 1, 2, 3, 4, 5, 6, 7].map(function (j) { return [34, (j - 3.5) * 6.4, -(j - 3.5) * 4]; });
      return [
        { rx: RX, groups: Y.map(function (y, i) { return G(O, 0, { wave: { amp: AMP[i], k: KK[i], speed: SP[i], phase: i * 1.3 } }); })
            .concat(Y.map(function (y, i) { return G(O, 0, { wave: { amp: 1.7, k: 1.1 + i * 0.17, speed: (i % 2 ? -6 : 7), phase: i } }); })),
          a: lines(Y, Z, X0, X1),
          b: lines(Y, Z, X0, X1, 5).concat(flat(Y.map(function (y, i) { return [ring([X0, y, Z[i]], 1.5, PI / 2, 0, { k: 3 }), ring([X1, y, Z[i]], 1.5, PI / 2, 0, { k: 3 })]; }))),
          labels: Y.map(function (y, i) { return { t: N[i], p: [X0, y - 9.5, Z[i]], a: 'left' }; }), spin: 0 },
        { rx: RX, groups: Y.map(function () { return G(O, 0, { wave: SYNC }); }).concat([G(O, 0, { wave: SYNC })]),
          a: lines(Y, Z, X0, X1),
          b: [-40, -32, -24, -16, -8, 0, 8, 16, 24, 32, 40].map(function (x) { return seg([x, Y[0], Z[0]], [x, Y[4], Z[4]], { c: 1, g: 5, flow: 0.18, k: 1.2 }); }),
          labels: Y.map(function (y, i) { return { t: N[i], p: [X0, y - 7, Z[i]], a: 'left' }; }), spin: 0 },
        { rx: RX, groups: Y.map(function () { return G(O, 0, { wave: { amp: 1.4, k: 0.2, speed: 2.2 } }); }).concat([G(O, 0, { wave: { amp: 0.9, k: 0.2, speed: 1.4 } }), G(O, 0, { wave: { amp: 1.2, k: 0.14, speed: 1 } })]),
          a: Y.map(function (y, i) { return seg([X0, 17 + (i - 2) * 1.6, Z[i]], [X1, 17 + (i - 2) * 1.6, Z[i]], { g: i }); }),
          b: [gridXZ([0, 1, 0], 84, 40, { g: 5, k: 0.5 }), rectXZ([0, 1, 0], 84, 40, { g: 5, k: 0.5 }), gridXZ([0, -15, 0], 84, 40, { c: 1, g: 6, k: 1.25 }), rectXZ([0, -15, 0], 84, 40, { c: 1, g: 6, k: 1.3 })],
          labels: [{ t: 'LO VIEJO', p: [0, 29, 0], a: 'center', fixed: true }, { t: 'UNA PANTALLA MÁS CLARA', p: [0, -27, 0], a: 'center', c: 1, fixed: true }], spin: 0 },
        { rx: RX, groups: Y.map(function () { return G(O, 0, { wave: { amp: 1.3, k: 0.3, speed: 2.6 } }); }),
          a: Y.map(function (y, i) { return seg([X0, (i - 2) * 1.5, -(i - 2) * 1.8], [-3, (i - 2) * 1.5, -(i - 2) * 1.8], { g: i }); }),
          b: PPL.map(function (p) { return sphere(p, 2.3, { k: 3 }); })
            .concat(PPL.map(function (p) { return bez([-3, 0, 0], [16, 0, 0], p, { c: 1, flow: 0.24, k: 1 }); }))
            .concat([ring(PPL[REV], 4.6, PI / 2, 0, { c: 1, k: 2.4 }), ring([-3, 0, 0], 4.4, PI / 2, PI / 2, { c: 1, k: 2 })]),
          labels: [{ t: 'LOS DATOS DE TU EMPRESA', p: [-24, 9, 0], a: 'center' }, { t: 'UNA PERSONA REVISA', p: [PPL[REV][0], PPL[REV][1] - 6, PPL[REV][2]], a: 'center', c: 1 }], spin: 0 },
        { rx: RX, groups: Y.map(function () { return G(O, 0, { wave: { amp: 2.4, k: 0.2, speed: 2.2 } }); }).concat([G(O, 0, { wave: { amp: 2.4, k: 0.2, speed: 2.2 } }), G(O, 0, { wave: { amp: 15, k: 0.105, speed: -1.5, ecg: 1 } })]),
          a: Y.map(function (y, i) { return seg([X0, y + 7, Z[i]], [X1, y + 7, Z[i]], { g: i }); }),
          b: [-36, -18, 0, 18, 36].map(function (x) { return seg([x, Y[0] + 7, Z[0]], [x, Y[4] + 7, Z[4]], { c: 1, g: 5, flow: 0.18, k: 0.8 }); })
            .concat([seg([X0, -20, 0], [X1, -20, 0], { c: 1, g: 6, k: 4.2 }), seg([X0, -19.2, 0], [X1, -19.2, 0], { c: 1, g: 6, k: 2 })]),
          labels: Y.map(function (y, i) { return { t: N[i], p: [X0, y + 0.5, Z[i]], a: 'left' }; }).concat([{ t: 'CADA MES', p: [X1, -27, 0], a: 'right', c: 1, fixed: true }]), spin: 0 }
      ]; } },

    // G · Matriz: each program is a block of data. They line up on a bus, get new layers on top, and a scan passes through them
    G: { name: 'Matriz', set: 'tec', group: 0.5, turn: 0.3, zoom: 0.84, build: function (N) {
      var TL = [[0.6, 0.4], [-0.5, 0.7], [0.9, -0.3], [0.4, -0.8], [-0.7, -0.4]];
      var X1 = [-36, -18, 0, 18, 36].map(function (x) { return [x, 0, 0]; }), X2 = [-22, -11, 0, 11, 22].map(function (x) { return [x, 17, 0]; });
      var BLOCK = [[-5.2, -5.2, -5.2], [5.2, 5.2, -5.2], [5.2, -5.2, 5.2], [-5.2, 5.2, 5.2], [0, 0, 0]], W4 = circle(26, 3);
      var vox = function (pts, sz) { return pts.map(function (c, i) { return voxel(c, sz, { g: i }); }); };
      return [
        { groups: SCAT.map(function (c, i) { return G(c, (i % 2 ? -1 : 1) * (0.4 + i * 0.07), { bob: 1, tx: TL[i][0], tz: TL[i][1] }); }),
          a: vox(SCAT, 11.5), b: SCAT.map(function (c, i) { return cube(c, 16, { g: i }); }),
          labels: names(N, SCAT, -13), spin: 0.05 },
        { groups: X1.map(function (c) { return G(c, 0); }),
          a: vox(X1, 9.5),
          b: X1.map(function (c, i) { return cube(c, 12.5, { g: i, k: 0.8 }); })
            .concat([seg([-47, 8.5, -4.5], [47, 8.5, -4.5], { c: 1, flow: 0.16, k: 2.2 }), seg([47, 8.5, 4.5], [-47, 8.5, 4.5], { c: 1, flow: 0.16, k: 2.2 })])
            .concat(flat(X1.map(function (c) { return [seg([c[0], 4.7, -4.5], [c[0], 8.5, -4.5], { c: 1, flow: 0.4, k: 2.5 }), seg([c[0], 4.7, 4.5], [c[0], 8.5, 4.5], { c: 1, flow: 0.4, k: 2.5 })]; }))),
          labels: names(N, X1, -9.5), spin: 0.06 },
        { groups: X2.map(function (c) { return G(c, 0); }),
          a: vox(X2, 7.6),
          b: [rectXZ([0, 17, 0], 60, 16, { k: 0.8 }), gridXZ([0, 3, 0], 64, 26, { k: 0.75 }), rectXZ([0, 3, 0], 64, 26, { k: 0.6 }), gridXZ([0, -12, 0], 64, 26, { c: 1, k: 1.9 }), rectXZ([0, -12, 0], 64, 26, { c: 1, k: 1.6 })]
            .concat(X2.map(function (c) { return seg([c[0], 13, 0], [c[0], -12, 0], { c: 1, flow: 0.3, k: 1 }); })),
          labels: [{ t: 'LO VIEJO', p: [0, 27, 0], a: 'center', fixed: true }, { t: 'UNA PANTALLA MÁS CLARA', p: [0, -22, 0], a: 'center', c: 1, fixed: true }], spin: 0.08 },
        { groups: BLOCK.map(function () { return G(O, 0.3); }),
          a: vox(BLOCK, 8.6),
          b: PEOPLE.map(function (p) { return voxel(p, 3.8, { k: 3 }); })
            .concat(PEOPLE.map(function (p) { return seg(lerp3(O, p, 0.34), lerp3(O, p, 0.88), { c: 1, flow: 0.22, k: 1.15 }); }))
            .concat([cube(PEOPLE[REV], 8.5, { c: 1, k: 1.8 }), ring(O, 33, 0.35, 0.2, { k: 0.3 })]),
          labels: [{ t: 'LOS DATOS DE TU EMPRESA', p: [0, 15, 0], a: 'center' }, { t: 'UNA PERSONA REVISA', p: [PEOPLE[REV][0], PEOPLE[REV][1] - 8.5, PEOPLE[REV][2]], a: 'center', c: 1 }], spin: 0.14 },
        { groups: W4.map(function (c) { return G(c, 0.35); }).concat([G(CORE, -0.6), G(CORE, 0, { scan: { axis: 'y', range: 15, speed: 0.75 } })]),
          a: vox(W4, 8),
          b: [voxel(CORE, 9, { c: 1, g: 5, k: 1.2 })].concat(W4.map(function (c) { return seg(c, lerp3(c, CORE, 0.76), { c: 1, flow: 0.24, k: 1.1 }); }))
            .concat([rectXZ(CORE, 74, 74, { c: 1, g: 6, k: 1.3 }), gridXZ(CORE, 70, 70, { c: 1, g: 6, k: 0.2 })]),
          labels: names(N, W4, -8.5).concat([{ t: 'CADA MES', p: [-37, 3, 37], a: 'center', c: 1, g: 6 }]), spin: 0.12 }
      ]; } },

    // H · Engranajes: each program is a gear. Loose and turning alone; then they mesh and one drives them all
    H: { name: 'Engranajes', set: 'tec', group: 0.3, turn: 0.14, zoom: 0.84, build: function (N) {
      var RX = 0.82, TL = [[0.7, 0.3], [-0.5, 0.6], [0.4, -0.3], [0.9, -0.5], [-0.8, -0.3]], R0 = [10, 8, 11, 7.5, 9];
      var CEN = [0, 4, 0], RC = 12, RS = 8, D = (RC + RS) * 0.91, W = 0.45;
      var S1 = [0, 1, 2, 3, 4].map(function (i) { var a = i * TAU / 5 - TAU / 4; return [Math.cos(a) * D, 4, Math.sin(a) * D]; });
      var S2 = circle(9.6, 18), S3 = circle(9.2, 6);
      var PPL = [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { var a = i * TAU / 8 + 0.3; return [Math.cos(a) * 34, 6, Math.sin(a) * 34]; });
      return [
        { rx: 0.45, groups: SCAT.map(function (c, i) { return G(c, (i % 2 ? -1 : 1) * (0.5 + i * 0.13), { bob: 1, tx: TL[i][0], tz: TL[i][1] }); }),
          a: SCAT.map(function (c, i) { return gear(c, R0[i], Math.round(R0[i] * 2), { g: i }); }),
          b: flat(SCAT.map(function (c, i) { return gearIn(c, R0[i], i, 0); })),
          labels: names(N, SCAT, -13), spin: 0.04 },
        { rx: RX, groups: S1.map(function (c) { return G(c, -W * RC / RS); }).concat([G(CEN, W)]),
          a: S1.map(function (c, i) { return gear(c, RS, 16, { g: i }); }),
          b: flat(S1.map(function (c, i) { return gearIn(c, RS, i, 0); })).concat([gear(CEN, RC, 24, { c: 1, g: 5, k: 1.8 })], gearIn(CEN, RC, 5, 1, 1.5), [ring(CEN, 32, 0, 0, { k: 0.4 })]),
          labels: names(N, S1, -5), spin: 0.03 },
        { rx: 0.6, groups: S2.map(function (c, i) { return G(c, (i % 2 ? -0.9 : 0.9)); }).concat([G([0, 3, 0], 0.25), G([0, -13, 0], -0.16)]),
          a: S2.map(function (c, i) { return gear(c, 5.2, 10, { g: i }); }),
          b: flat(S2.map(function (c, i) { return gearIn(c, 5.2, i, 0, 0.6); })).concat([seg([0, 22, 0], [0, -22, 0], { k: 0.9 }), gear([0, 3, 0], 19, 32, { g: 5, k: 0.8 }), ring([0, 3, 0], 6, 0, 0, { g: 5, k: 0.7 }),
            gear([0, -13, 0], 27, 44, { c: 1, g: 6, k: 1.5 })], gearIn([0, -13, 0], 27, 6, 1, 1.1)),
          labels: [{ t: 'LO VIEJO', p: [0, 29, 0], a: 'center', fixed: true }, { t: 'UNA PANTALLA MÁS CLARA', p: [0, -27, 0], a: 'center', c: 1, fixed: true }], spin: 0.03 },
        { rx: RX, groups: S3.map(function (c, i) { return G(c, (i % 2 ? -0.8 : 0.8)); }).concat(PPL.map(function (p, i) { return G(p, (i % 2 ? -1.5 : 1.5)); })),
          a: S3.map(function (c, i) { return gear(c, 5.6, 11, { g: i }); }),
          b: flat(S3.map(function (c, i) { return gearIn(c, 5.6, i, 0, 0.6); }))
            .concat(PPL.map(function (p, i) { return gear(p, 3.6, 8, { g: 5 + i, k: 1.9 }); })).concat(PPL.map(function (p, i) { return ring(p, 1.2, 0, 0, { g: 5 + i, k: 3 }); }))
            .concat(PPL.map(function (p) { return seg(lerp3([0, 6, 0], p, 0.46), lerp3([0, 6, 0], p, 0.87), { c: 1, flow: 0.24, k: 1.2 }); }))
            .concat([ring(PPL[REV], 6.4, 0, 0, { c: 1, k: 2.2 }), ring([0, 6, 0], 34, 0, 0, { k: 0.3 })]),
          labels: [{ t: 'LOS DATOS DE TU EMPRESA', p: [0, 6, 22], a: 'center' }, { t: 'UNA PERSONA REVISA', p: [PPL[REV][0], PPL[REV][1], PPL[REV][2] - 9], a: 'center', c: 1 }], spin: 0.03 },
        { rx: RX, groups: S1.map(function (c) { return G(c, -W * RC / RS); }).concat([G(CEN, W)], pulseG(CEN), [G(CEN, 0.5)]),
          a: S1.map(function (c, i) { return gear(c, RS, 16, { g: i }); }),
          b: flat(S1.map(function (c, i) { return gearIn(c, RS, i, 0); })).concat([gear(CEN, RC, 24, { c: 1, g: 5, k: 1.8 })], gearIn(CEN, RC, 5, 1, 1.5))
            .concat([6, 7, 8].map(function (g) { return ring(CEN, 46, 0, 0, { c: 1, g: g, k: 1.1 }); }), [ring(CEN, 38, 0, 0, { k: 0.4 }), gear([38, 4, 0], 3.6, 8, { c: 1, g: 9, k: 3 }), ring([38, 4, 0], 1.3, 0, 0, { c: 1, g: 9, k: 4 })]),
          labels: names(N, S1, -5).concat([{ t: 'CADA MES', p: [38, -2, 0], a: 'center', c: 1, g: 9 }]), spin: 0.03 }
      ]; } }
  };

  // ---------- Engine ----------
  // opts: canvas, variant ('A'…), progress() -> 0…(scenes-1) target, only [scene keys], onScene(index), onProgress(0…1), small, count, pointer (element)
  function mount(opts) {
    var canvas = opts.canvas, ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var small = opts.small != null ? opts.small : window.innerWidth < 720;
    var V = VARIANTS[opts.variant] || VARIANTS.A;
    var N = opts.count || Math.round((small ? 2000 : 3800) * (V.dots || 1));
    var NAMES = ['ERP', small ? 'TÉCNICOS' : 'PROGRAMAS TÉCNICOS', small ? 'HOJAS' : 'HOJAS DE CÁLCULO', 'CORREO', 'WHATSAPP'];
    var SCENES = V.build(NAMES.map(word));
    SCENES.forEach(function (sc) { (sc.labels || []).forEach(function (l) { l.t = word(l.t); }); });
    // `only`: build just these scenes (by key), in this order. The home story asks for the scenes of its captions.
    if (opts.only && SCENES.some(function (sc) { return sc.key; })) {
      var pick = opts.only.map(function (k) { return SCENES.filter(function (sc) { return sc.key === k; })[0]; }).filter(Boolean);
      if (pick.length === 1) pick.push(pick[0]);
      if (pick.length) SCENES = pick;
    }
    var S = SCENES.length;

    var R1 = new Float32Array(N), R2 = new Float32Array(N), R3 = new Float32Array(N), i;                 // per-dot randoms, the same in every scene
    for (i = 0; i < N; i++) { R1[i] = Math.random(); R2[i] = Math.random() * 2 - 1; R3[i] = Math.random() * 2 - 1; }
    function alloc() { var o = {}; ['x', 'y', 'z', 'qx', 'qy', 'qz', 'ex', 'ey', 'ez', 'u', 'sp'].forEach(function (k) { o[k] = new Float32Array(N); }); o.sr = new Float32Array(N); o.ox = new Float32Array(N); o.oz = new Float32Array(N); o.s0 = new Float32Array(N); o.s1 = new Float32Array(N).fill(1); o.rid = new Int16Array(N); o.c = new Uint8Array(N); o.lin = new Uint8Array(N); o.g = new Int8Array(N); o.sz = new Float32Array(N).fill(1); return o; }
    function place(prims, n, o, off) {
      if (!n || !prims.length) return;
      var total = prims.reduce(function (a, p) { return a + p.wt; }, 0), done = 0, acc = 0;
      prims.forEach(function (p, pi) {
        acc += p.wt;
        var upto = pi === prims.length - 1 ? n : Math.round(n * acc / total), m = upto - done, j, i, v;
        for (j = 0; j < m; j++) {
          i = off + done + j; o.c[i] = p.c; o.g[i] = p.g; o.sp[i] = 0; o.sz[i] = p.size;
          if (p.flow) { o.x[i] = p.p[0]; o.y[i] = p.p[1]; o.z[i] = p.p[2]; o.qx[i] = p.q[0]; o.qy[i] = p.q[1]; o.qz[i] = p.q[2]; o.ex[i] = p.e[0]; o.ey[i] = p.e[1]; o.ez[i] = p.e[2]; o.u[i] = (j + 0.5) / m; o.sp[i] = p.flow; o.lin[i] = p.lin ? 1 : 0; o.sr[i] = p.sr || 0.5; if (p.span) { o.s0[i] = p.span[0]; o.s1[i] = p.span[1]; } o.rid[i] = p.rid || 0;
            // a river: each dot has its own lane and speed. The lanes crowd towards the middle (cube of a random number), so the
            // centre of the trace is solid and it thins out towards the banks; dots near the middle are also bigger. One in ten splashes.
            if (p.river) { var lane = Math.abs(R2[i] * R2[i] * R2[i]) * p.river * p.narrow * (R1[i] > 0.9 ? 1.7 : 1);
              o.ox[i] = (R2[i] < 0 ? -lane : lane); o.oz[i] = (R3[i] < 0 ? -lane : lane); o.sp[i] = p.flow * (0.6 + 0.8 * R1[i]); o.sz[i] = p.size * (1 + p.narrow * (0.3 - 0.8 * Math.abs(R2[i]))); } }
          else { v = p.pt((j + 0.5) / m, j, m); o.x[i] = v[0]; o.y[i] = v[1]; o.z[i] = v[2]; }
        }
        done = upto;
      });
    }
    var nA = Math.round(N * V.group), nR = Math.round(N * (V.pinned || 0));
    var P = SCENES.map(function (sc) { var o = alloc(); place(sc.a, nA, o, 0);
      if (sc.r) { place(sc.r, nR, o, nA); place(sc.b, N - nA - nR, o, nA + nR); } else place(sc.b, N - nA, o, nA);
      return o; });
    // COHERENCE. A dot keeps its number through the story, so where dot 812 goes next depends on which place of the next
    // scene carries the number 812. Left alone that is arbitrary and dots cross each other. Here the places of each scene
    // are handed out again so that every dot travels to a place NEAR where it is: both sets are split in half along x,
    // then along z, then along y, again and again, and matched half to half. Neighbours stay neighbours.
    if (V.coherent) {
      var KEYS = ['x', 'y', 'z', 'qx', 'qy', 'qz', 'ex', 'ey', 'ez', 'u', 'sp', 'sr', 'ox', 'oz', 's0', 's1', 'rid', 'c', 'lin', 'g', 'sz'];
      var where = function (o, i, ax) {                         // resting place of a dot (a flow counts where it sits on its path)
        if (!o.sp[i]) return ax === 0 ? o.x[i] : ax === 1 ? o.z[i] : o.y[i];
        var u = o.s0[i] + (o.s1[i] - o.s0[i]) * o.u[i], a0 = ax === 0 ? o.x[i] : ax === 1 ? o.z[i] : o.y[i], a1 = ax === 0 ? o.ex[i] : ax === 1 ? o.ez[i] : o.ey[i];
        return a0 + (a1 - a0) * u; };
      var pair = function (oa, ob, ia, ib, depth, res) {
        if (ia.length <= 1) { if (ia.length) res.push([ia[0], ib[0]]); return; }
        var ax = depth % 3;
        ia.sort(function (p, q) { return where(oa, p, ax) - where(oa, q, ax); }); ib.sort(function (p, q) { return where(ob, p, ax) - where(ob, q, ax); });
        var h = ia.length >> 1;
        pair(oa, ob, ia.slice(0, h), ib.slice(0, h), depth + 1, res); pair(oa, ob, ia.slice(h), ib.slice(h), depth + 1, res); };
      for (var sI = 1; sI < S; sI++) {
        var both = SCENES[sI - 1].r && SCENES[sI].r, lo = nA + (both ? nR : 0), ia = [], ib = [], res = [], kk, n;   // pinned dots shared by both scenes stay put
        for (i = lo; i < N; i++) { ia.push(i); ib.push(i); }
        pair(P[sI - 1], P[sI], ia, ib, 0, res);
        if (V.coherentA) { ia = []; ib = []; for (i = 0; i < nA; i++) { ia.push(i); ib.push(i); } pair(P[sI - 1], P[sI], ia, ib, 0, res); }
        for (kk = 0; kk < KEYS.length; kk++) { var arr = P[sI][KEYS[kk]], copy = arr.slice(); for (n = 0; n < res.length; n++) arr[res[n][0]] = copy[res[n][1]]; }
      }
    }

    var NS = small ? 70 : 150, STAR = new Float32Array(NS * 3);       // a sparse far field: depth, and one space for the whole story
    for (i = 0; i < NS; i++) { var sy0 = Math.random() * 2 - 1, sq = Math.sqrt(1 - sy0 * sy0), sa0 = Math.random() * TAU, sr = 70 + Math.random() * 60;
      STAR[i * 3] = Math.cos(sa0) * sq * sr; STAR[i * 3 + 1] = sy0 * sr * 0.7; STAR[i * 3 + 2] = Math.sin(sa0) * sq * sr; }

    var FOCAL = V.focal || 170;                                      // bigger = flatter, less perspective
    var W = 0, H = 0, dpr = 1, scale = 1;
    function resize() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      scale = Math.min(W / VW, H / VH) * (V.zoom || 1);
    }
    var px = 0, py = 0, tpx = 0, tpy = 0;                                  // the pointer tilts the scene a little
    function onMove(e) { if (e.pointerType === 'touch') return; tpx = (e.clientX / window.innerWidth - 0.5) * 2; tpy = (e.clientY / window.innerHeight - 0.5) * 2; }
    var pel = opts.pointer || canvas; pel.addEventListener('pointermove', onMove);
    // drag on the drawing: turn it (left/right) and tip it (up/down). On touch only sideways drags reach us (CSS touch-action: pan-y)
    var dragging = false, dYaw = 0, dTilt = 0, dYawT = 0, dTiltT = 0, lastX = 0, lastY = 0;
    function onDown(e) { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.classList.add('is-dragging'); if (canvas.setPointerCapture) try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
    function onDrag(e) { if (!dragging) return; dYaw += (e.clientX - lastX) * 0.006; dTilt = Math.max(-0.9, Math.min(0.9, dTilt - (e.clientY - lastY) * 0.005)); lastX = e.clientX; lastY = e.clientY; dYawT = dYaw; dTiltT = dTilt; if (reduce) draw(0); }
    function onUp() { dragging = false; canvas.classList.remove('is-dragging'); }
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onDrag);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp); canvas.addEventListener('pointerleave', function () { if (dragging) onUp(); });

    function clamp(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
    function io(t) { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    // where a dot is inside its scene: its flow, the turn of its group, the heartbeat
    var out = [0, 0, 0, 1];
    function group(g, gi, t, w, x, y, z) {                       // applies a group's own motion to a point
      var u, m, a, dx, dy, dz, ca, sa, sz = 1;
      if (g.pulse != null) { u = (t * 0.2 + g.pulse) % 1; m = 0.14 + 0.86 * u; x = g.c[0] + (x - g.c[0]) * m; z = g.c[2] + (z - g.c[2]) * m; sz = Math.sin(u * PI); }
      else {
        if (g.w) { a = t * g.w; ca = Math.cos(a); sa = Math.sin(a); dx = x - g.c[0]; dz = z - g.c[2]; x = g.c[0] + dx * ca + dz * sa; z = g.c[2] - dx * sa + dz * ca; }
        if (g.tx) { ca = Math.cos(g.tx); sa = Math.sin(g.tx); dy = y - g.c[1]; dz = z - g.c[2]; y = g.c[1] + dy * ca - dz * sa; z = g.c[2] + dy * sa + dz * ca; }
        if (g.tz) { ca = Math.cos(g.tz); sa = Math.sin(g.tz); dx = x - g.c[0]; dy = y - g.c[1]; x = g.c[0] + dx * ca - dy * sa; y = g.c[1] + dx * sa + dy * ca; }
        if (g.bob) { x += Math.cos(t * 0.5 + gi * 1.9) * 1.1 * w * g.bob; y += Math.sin(t * 0.62 + gi * 2.6) * 1.5 * w * g.bob; }
        if (g.wave) { u = (x * g.wave.k + t * g.wave.speed + (g.wave.phase || 0)) / TAU; u -= Math.floor(u); y += g.wave.amp * (g.wave.ecg ? ecg(u) : Math.sin(u * TAU)); }
        if (g.scan) { a = g.scan.range * Math.sin(t * g.scan.speed); if (g.scan.axis === 'y') y += a; else if (g.scan.axis === 'z') z += a; else x += a; }
      }
      out[0] = x; out[1] = y; out[2] = z; out[3] = sz;
    }
    function onRoute(o, i, par) {                                 // a point at `par` (0…1) of the right-angle route of dot i
      var m = o.sr[i], u;
      if (par < m) { u = par / m; out[0] = o.x[i] + (o.qx[i] - o.x[i]) * u; out[1] = o.y[i] + (o.qy[i] - o.y[i]) * u; out[2] = o.z[i] + (o.qz[i] - o.z[i]) * u; }
      else { u = (par - m) / (1 - m); out[0] = o.qx[i] + (o.ex[i] - o.qx[i]) * u; out[1] = o.qy[i] + (o.ey[i] - o.qy[i]) * u; out[2] = o.qz[i] + (o.ez[i] - o.qz[i]) * u; }
    }
    function local(o, sc, i, t, w) {
      var x = o.x[i], y = o.y[i], z = o.z[i], u, m, gi = o.g[i];
      if (o.sp[i]) { u = (o.u[i] + t * o.sp[i]) % 1; u = o.s0[i] + (o.s1[i] - o.s0[i]) * u;
        if (o.lin[i]) { m = o.sr[i];                                  // along a trace with a right angle
          if (u < m) { u = u / m; x += (o.qx[i] - x) * u; y += (o.qy[i] - y) * u; z += (o.qz[i] - z) * u; }
          else { u = (u - m) / (1 - m); x = o.qx[i] + (o.ex[i] - o.qx[i]) * u; y = o.qy[i] + (o.ey[i] - o.qy[i]) * u; z = o.qz[i] + (o.ez[i] - o.qz[i]) * u; } }
        else { m = 1 - u; x = m * m * x + 2 * m * u * o.qx[i] + u * u * o.ex[i]; y = m * m * y + 2 * m * u * o.qy[i] + u * u * o.ey[i]; z = m * m * z + 2 * m * u * o.qz[i] + u * u * o.ez[i]; }
        x += o.ox[i]; z += o.oz[i]; }
      if (gi >= 0) group(sc.groups[gi], gi, t, w, x, y, z); else { out[0] = x; out[1] = y; out[2] = z; out[3] = 1; }
      if (o.rid[i]) { u = (o.s1[i] - o.s0[i]) / 0.05; out[3] *= u < 0 ? 0 : u > 1 ? 1 : u; }
    }

    var cur = Math.max(0, Math.min(S - 1, opts.progress())), last = 0, yaw = 0, active = -1;
    function draw(time) {
      var dt = last ? Math.min(0.05, (time - last) / 1000) : 0.016; last = time;
      var want = Math.max(0, Math.min(S - 1, opts.progress()));
      cur = reduce ? want : cur + (want - cur) * (1 - Math.exp(-dt * 6));
      if (Math.abs(want - cur) < 0.0004) cur = want;
      px += (tpx - px) * (1 - Math.exp(-dt * 4)); py += (tpy - py) * (1 - Math.exp(-dt * 4));
      var s = Math.min(S - 2, Math.floor(cur)), f = cur - s;
      var e = reduce ? (f < 0.5 ? 0 : 1) : clamp((f - 0.16) / 0.68);
      var now = Math.round(s + e);
      if (now !== active) { active = now; dYawT = 0; dTiltT = 0; if (opts.onScene) opts.onScene(active, S); }       // a new scene starts from its own angle
      if (opts.onProgress) opts.onProgress(cur / (S - 1));

      var A = P[s], B = P[s + 1], SA = SCENES[s], SB = SCENES[s + 1], t = reduce ? 0 : time * 0.001, K = 0.7;
      if (!reduce) yaw += dt * (SA.spin + (SB.spin - SA.spin) * e);
      var rxa = SA.rx == null ? 0.36 : SA.rx, rxb = SB.rx == null ? 0.36 : SB.rx;
      var ya = SA.yaw == null ? (V.yaw || 0) : SA.yaw, yb = SB.yaw == null ? (V.yaw || 0) : SB.yaw;
      // the visitor can turn the drawing by dragging it; it stays where it is on the page and eases back when the scene changes
      if (!dragging) { dYaw += (dYawT - dYaw) * (1 - Math.exp(-dt * 2.2)); dTilt += (dTiltT - dTilt) * (1 - Math.exp(-dt * 2.2)); }
      var ry = ya + (yb - ya) * io(e) + (V.sway ? Math.sin(t * 0.28) * V.sway : 0) + yaw + cur * (V.turn == null ? 0.55 : V.turn) + px * (V.yaw != null ? 0.1 : 0.45) + dYaw;
      var rx = rxa + (rxb - rxa) * io(e) + py * (V.yaw != null ? 0.06 : 0.16) + dTilt;
      rx = Math.max(-1.56, Math.min(1.56, rx));
      var cy = Math.cos(ry), sy = Math.sin(ry), cxr = Math.cos(rx), sxr = Math.sin(rx);
      // a scene can ask for its own framing: zoom (1 = the version's), dy (how far down the drawing sits) and dx (how far right)
      var scl = scale * ((SA.zoom || 1) + ((SB.zoom || 1) - (SA.zoom || 1)) * io(e));
      var r0 = Math.max(0.8, scl * 0.14) * dpr, cx0 = W / 2 + ((SA.dx || 0) + ((SB.dx || 0) - (SA.dx || 0)) * io(e)) * scl, cy0 = H / 2 + ((V.dy || 0) + (SA.dy || 0) + ((SB.dy || 0) - (SA.dy || 0)) * io(e)) * scl;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = INK; ctx.beginPath();
      var cyS = Math.cos(ry * 0.6), syS = Math.sin(ry * 0.6);                 // the far field turns slower: parallax
      for (var q = 0; q < NS; q++) {
        var qx = STAR[q * 3], qy = STAR[q * 3 + 1], qz = STAR[q * 3 + 2];
        var q1 = qx * cyS + qz * syS, qz1 = -qx * syS + qz * cyS, qy1 = qy * cxr - qz1 * sxr, qz2 = qy * sxr + qz1 * cxr;
        if (qz2 > -20) continue;
        var qk = FOCAL / (FOCAL - qz2), qr = r0 * 0.75 * qk, qsx = (cx0 + q1 * qk * scl) * dpr, qsy = (cy0 + qy1 * qk * scl) * dpr;
        ctx.moveTo(qsx + qr, qsy); ctx.arc(qsx, qsy, qr, 0, TAU);
      }
      ctx.fill();
      for (var pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? ACCENT : INK;
        ctx.beginPath();
        for (var i = 0; i < N; i++) {
          var ei = io(e * (1 + K) - (clamp(A.x[i] / 80 + 0.5) * 0.8 + R1[i] * 0.2) * K);      // a wave from left to right
          var routed = A.rid[i] !== 0 && A.rid[i] === B.rid[i];                                 // the same trace in both scenes
          if ((ei < (routed ? 0.22 : 0.5) ? A.c[i] : B.c[i]) !== pass) continue;
          var x, y, z, sa2 = 1, sb2 = 1;
          if (routed) {                                                                         // it grows along its own path
            var uu = (B.u[i] + t * B.sp[i]) % 1, f0 = A.s0[i] + (B.s0[i] - A.s0[i]) * ei, f1 = A.s1[i] + (B.s1[i] - A.s1[i]) * ei;
            var wob = 1 + 0.25 * Math.sin(t * (0.8 + R1[i] * 1.4) + R1[i] * 40);                             // the water moves sideways as it runs
            onRoute(B, i, f0 + (f1 - f0) * uu);                                                             // width and dot size go from this scene's to the next one's
            x = out[0] + (A.ox[i] + (B.ox[i] - A.ox[i]) * ei) * wob; y = out[1]; z = out[2] + (A.oz[i] + (B.oz[i] - A.oz[i]) * ei) * wob;
            var la0 = A.s1[i] - A.s0[i], len = f1 - f0;                                                     // growing: visible from the start · going: it thins out, it does not pile up at one end
            sa2 = sb2 = Math.max(0, Math.min(1, B.s1[i] - B.s0[i] < la0 ? len / la0 : len / 0.05)) * (A.sz[i] + (B.sz[i] - A.sz[i]) * ei);
          } else {
            local(A, SA, i, t, 1 - ei); var ax = out[0], ay = out[1], az = out[2]; sa2 = out[3] * A.sz[i];
            local(B, SB, i, t, ei);     var bx = out[0], by = out[1], bz = out[2]; sb2 = out[3] * B.sz[i];
            // between scenes the whole cloud turns like a slow whirlpool and opens a little, then settles
            // (a "calm" scene is entered without the turn: things just move to their new place)
            if (V.calm || SB.calm) {                                                            // straight to its new place, lifting a little on the way
              var far = Math.abs(bx - ax) + Math.abs(by - ay) + Math.abs(bz - az);
              x = ax + (bx - ax) * ei; z = az + (bz - az) * ei;
              y = ay + (by - ay) * ei + Math.sin(ei * PI) * Math.min(1, far / 14) * (V.lift || 0);
            } else {
              var mid = Math.sin(ei * PI), sw = mid * 1.15, cs = Math.cos(sw), sn = Math.sin(sw), open = 1 + mid * 0.16;
              var xi = (ax + (bx - ax) * ei) * open, zi = (az + (bz - az) * ei) * open;
              x = xi * cs + zi * sn; z = -xi * sn + zi * cs + mid * R2[i] * 5;
              y = ay + (by - ay) * ei + mid * R2[i] * 3.5;
            }
          }
          var x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y1 = y * cxr - z1 * sxr, z2 = y * sxr + z1 * cxr;
          var k = FOCAL / (FOCAL - z2);
          var tw = 1 + 0.22 * Math.sin(t * 1.7 + R1[i] * 40);                                   // each dot breathes a little
          var r = r0 * k * k * tw * (sa2 + (sb2 - sa2) * ei) * ((ei < 0.5 ? A.sp[i] : B.sp[i]) && pass ? 1.6 : 1);
          if (r < 0.15) continue;
          var sxp = (cx0 + x1 * k * scl) * dpr, syp = (cy0 + y1 * k * scl) * dpr;
          ctx.moveTo(sxp + r, syp); ctx.arc(sxp, syp, r, 0, TAU);
        }
        ctx.fill();
      }

      // labels follow their point in space and step aside instead of overlapping
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var fs = Math.max(9, Math.min(13.5, scl * 1.65));
      ctx.font = '700 ' + fs + "px 'Alex23 secundaria', 'Courier New', monospace";
      ctx.textBaseline = 'middle';
      var la = 1 - io(e / 0.25), lb = io((e - 0.76) / 0.24), items = [];
      [[SA, la], [SB, lb]].forEach(function (pair) {
        if (pair[1] <= 0.02) return;
        pair[0].labels.forEach(function (l) {
          var x = l.p[0], y = l.p[1], z = l.p[2];
          if (l.g != null) { group(pair[0].groups[l.g], l.g, t, 1, x, y, z); x = out[0]; y = out[1]; z = out[2]; }
          var x1 = x, z1 = z;
          if (!l.fixed) { x1 = x * cy + z * sy; z1 = -x * sy + z * cy; }
          var y1 = y * cxr - z1 * sxr, z2 = y * sxr + z1 * cxr, k = FOCAL / (FOCAL - z2), tw = ctx.measureText(l.t).width, al = l.a || 'left', lx = cx0 + x1 * k * scl;
          items.push({ l: l, al: al, lx: lx, ly: cy0 + y1 * k * scl, tw: tw, z: l.fixed ? 999 : z2, alpha: pair[1], x0: lx - (al === 'center' ? tw / 2 : al === 'right' ? tw : 0) - 5 });
        });
      });
      items.sort(function (a, b) { return b.z - a.z; });
      var placed = [], step = fs * 1.85, TRY = [0, -1, 1, -2, 2, -3, 3];
      items.forEach(function (it) {
        var off = 0, n, j, q, hit;
        for (n = 0; n < TRY.length; n++) { off = TRY[n] * step; hit = false;
          for (j = 0; j < placed.length; j++) { q = placed[j]; if (it.x0 < q.x0 + q.w && it.x0 + it.tw + 10 > q.x0 && Math.abs(it.ly + off - q.y) < step) { hit = true; break; } }
          if (!hit) break; }
        placed.push({ x0: it.x0, w: it.tw + 10, y: it.ly + off });
        var l = it.l; l._o = l._o == null || reduce ? off : l._o + (off - l._o) * (1 - Math.exp(-dt * 9));
        var ly = it.ly + l._o;
        ctx.globalAlpha = it.alpha * 0.92; ctx.fillStyle = PAPER; ctx.fillRect(it.x0, ly - fs * 0.85, it.tw + 10, fs * 1.7);
        ctx.globalAlpha = it.alpha; ctx.fillStyle = l.c ? ACCENT : INK; ctx.textAlign = it.al; ctx.fillText(l.t, it.lx, ly);
      });
      ctx.globalAlpha = 1;
    }

    var running = false, raf = 0, dead = false;
    function loop(time) { draw(time); raf = running ? requestAnimationFrame(loop) : 0; }
    function start() { if (!running && !dead) { running = true; last = 0; raf = requestAnimationFrame(loop); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    function onResize() { resize(); draw(performance.now()); }
    resize();
    window.addEventListener('resize', onResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!dead) draw(performance.now()); });
    var obs = null;
    if (reduce) draw(0);
    else if ('IntersectionObserver' in window) { obs = new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }); obs.observe(opts.watch || canvas); }
    else start();
    draw(performance.now());
    return { redraw: function () { draw(reduce ? 0 : performance.now()); }, scenes: S, reduce: reduce, keys: SCENES.map(function (sc) { return sc.key || ''; }),
      destroy: function () { dead = true; stop(); if (obs) obs.disconnect(); window.removeEventListener('resize', onResize); pel.removeEventListener('pointermove', onMove); } };
  }

  window.ParticleStory = { mount: mount, variants: Object.keys(VARIANTS).map(function (k) { return { id: k, name: VARIANTS[k].name, set: VARIANTS[k].set || 'espacio' }; }) };

  // ---------- The home page: scroll drives the story ----------
  if (!window.requestAnimationFrame) return;
  var story = document.querySelector('.story');
  if (story) (function () {
    var canvas = story.querySelector('canvas');
    var caps = [].slice.call(story.querySelectorAll('.story__cap')), count = story.querySelector('.story__count'), bar = story.querySelector('.story__bar i');
    var asked = (new URLSearchParams(location.search).get('anim') || '').toUpperCase();        // ?anim=B previews another version
    var variant = VARIANTS[asked] ? asked : (story.getAttribute('data-variant') || 'A');
    story.classList.add('story--on');
    // One stop per caption. A caption names the scene it wants (data-scene); one that names none (a new line in the copy
    // that has no drawing yet) keeps the picture of the caption before it. Versions without named scenes go by position.
    var stops = null, shown = -1;
    story.style.height = (caps.length * 118 + 30) + 'vh';
    function at() { var r = story.getBoundingClientRect(), total = story.offsetHeight - (window.innerHeight - HEAD), p = total > 0 ? (HEAD - r.top) / total : 0; return Math.max(0, Math.min(1, p)) * (caps.length - 1); }
    function show(p) {
      var n = Math.round(p);
      if (n !== shown) { shown = n; caps.forEach(function (c, k) { c.classList.toggle('is-active', k === n); }); if (count) count.textContent = ('0' + (n + 1)).slice(-2) + ' / ' + ('0' + caps.length).slice(-2); }
      if (bar) bar.style.transform = 'scaleX(' + (caps.length > 1 ? p / (caps.length - 1) : 1).toFixed(4) + ')';
    }
    var inst = mount({
      canvas: canvas, variant: variant, watch: story, pointer: story,
      only: caps.map(function (c) { return c.getAttribute('data-scene'); }).filter(Boolean),
      progress: function () {
        var p = at(); show(p);
        if (!stops) return 0;
        var i = Math.min(stops.length - 2, Math.floor(p));
        return i < 0 ? stops[0] : stops[i] + (stops[i + 1] - stops[i]) * (p - i);
      }
    });
    if (inst) {
      var named = inst.keys.some(Boolean), before = 0;
      stops = caps.map(function (c, k) { var n = named ? inst.keys.indexOf(c.getAttribute('data-scene') || ' ') : Math.min(k, inst.scenes - 1); if (n < 0) n = before; before = n; return n; });
      inst.redraw();
    }
    if (inst && inst.reduce) window.addEventListener('scroll', function () { inst.redraw(); }, { passive: true });
  })();

})();
