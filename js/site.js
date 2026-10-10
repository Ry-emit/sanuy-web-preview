// Small behaviours shared by every page. No dependencies, no cookies.
(function () {
  var track = function (name, data) { if (window.umami && window.umami.track) window.umami.track(name, data || {}); };
  window.siteTrack = track;

  // 404: report the path that was asked for, to find broken links
  if (document.querySelector('[data-404]')) track('pagina_404', { ruta: location.pathname });

  // Support videos: count the first play of each one
  document.querySelectorAll('video[data-video-id]').forEach(function (v) {
    v.addEventListener('play', function () { track('video_play', { id: v.getAttribute('data-video-id'), pagina: location.pathname }); }, { once: true });
  });
})();
