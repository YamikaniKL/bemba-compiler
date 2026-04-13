/**
 * Optional progressive enhancement for static `pangaIpepa` sites.
 * Emitted to `out/bemba-site.js` on `bemba fumya` / HTML export when enabled.
 */
(function () {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.add('bemba-js');

    document.addEventListener('click', function (ev) {
        var t = ev.target;
        if (!t || !t.closest) return;
        var btn = t.closest('[data-bemba-nav-toggle]');
        if (!btn) return;
        var id = btn.getAttribute('aria-controls');
        if (!id) return;
        var panel = document.getElementById(id);
        if (!panel) return;
        var open = panel.hidden === false;
        panel.hidden = open;
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
})();
