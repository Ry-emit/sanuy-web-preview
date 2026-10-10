// Diagrams: play once at 40 % on screen. No script or reduced motion = final frame.
(function () {
  var figs = document.querySelectorAll('.explainer');
  if (!figs.length || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function play(el) {
    el.classList.remove('is-done', 'is-playing'); void el.offsetWidth; el.classList.add('is-playing');
    clearTimeout(el._t); el._t = setTimeout(function () { el.classList.add('is-done'); }, +el.getAttribute('data-ms') + 400);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); play(e.target); } });
  }, { threshold: 0.4 });
  [].forEach.call(figs, function (el) {
    el.classList.add('is-armed');
    el.querySelector('button').onclick = function () { play(el); if (window.siteTrack) siteTrack('diagrama_replay', { id: el.getAttribute('data-id'), pagina: location.pathname }); };
    io.observe(el);
  });
})();
