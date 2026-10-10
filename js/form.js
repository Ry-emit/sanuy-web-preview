// Diagnostic form: sends the five fields to the form handler and shows the confirmation in the same page.
// The event form_diagnostico is fired only when the server has accepted the submission. Form content is never
// sent to analytics.
(function () {
  document.querySelectorAll('form[data-form="diagnostico"]').forEach(function (form) {
    var ok = form.querySelector('[data-ok]'), err = form.querySelector('[data-error]'), btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ok.hidden = true; err.hidden = true;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      btn.disabled = true;
      fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () {
          form.reset(); ok.hidden = false; ok.focus && ok.setAttribute('tabindex', '-1'); ok.focus();
          if (window.siteTrack) window.siteTrack('form_diagnostico', { pagina: form.getAttribute('data-pagina') });
        })
        .catch(function () { err.hidden = false; })
        .then(function () { btn.disabled = false; });
    });
  });
})();
