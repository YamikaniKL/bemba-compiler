const { BEMBA_FOLDERS } = require('./constants');

/**
 * URL path for a file under `amashinda/` (project public folder).
 * @param {string} rel - e.g. `hero.webp` or `/hero.webp`
 * @returns {string} e.g. `/amashinda/hero.webp`
 */
function publicAssetUrl(rel) {
    const r = String(rel || '').replace(/^\/+/, '');
    if (!r) return `/${BEMBA_FOLDERS.PUBLIC}/`;
    return `/${BEMBA_FOLDERS.PUBLIC}/${r}`;
}

/**
 * Build a responsive `<picture>` element (trusted attribute values — escape src yourself if dynamic).
 * @param {object} o
 * @param {string} o.src - Fallback `img` src (e.g. JPEG)
 * @param {string} o.alt
 * @param {Array<{ srcset: string, media?: string, type?: string }>} [o.sources]
 * @param {string} [o.class]
 * @param {string} [o.sizes]
 * @param {boolean} [o.loadingLazy]
 */
function buildPictureHtml(o) {
    if (!o || !o.src) return '';
    const esc = (s) =>
        String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;');
    const cls = o.class ? ` class="${esc(o.class)}"` : '';
    const sizes = o.sizes ? ` sizes="${esc(o.sizes)}"` : '';
    const loading = o.loadingLazy ? ' loading="lazy" decoding="async"' : '';
    const parts = [];
    for (const s of o.sources || []) {
        if (!s || !s.srcset) continue;
        const media = s.media ? ` media="${esc(s.media)}"` : '';
        const type = s.type ? ` type="${esc(s.type)}"` : '';
        parts.push(`<source srcset="${esc(s.srcset)}"${type}${media} />`);
    }
    parts.push(
        `<img src="${esc(o.src)}" alt="${esc(o.alt || '')}"${cls}${sizes}${loading} />`
    );
    return `<picture>${parts.join('')}</picture>`;
}

module.exports = { publicAssetUrl, buildPictureHtml };
