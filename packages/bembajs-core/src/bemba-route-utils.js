/**
 * URL path for a page file relative to `amapeji/` (e.g. `index.bemba`, `about/index.bemba`).
 * Matches the router used by the dev server and must stay in sync with `router.js`.
 * @param {string} filePath - relative path with `.bemba`
 * @returns {string} e.g. `/`, `/about`, `/post/:id`
 */
function filePathToPageRoute(filePath) {
    let route = String(filePath || '')
        .replace(/\\/g, '/')
        .replace(/\.bemba$/, '')
        .replace(/^\/?index$/, '')
        .replace(/\/index$/, '/')
        .replace(/\/$/, '');

    route = route.replace(/\[([^\]]+)\]/g, ':$1');
    route = route.replace(/\[\.\.\.([^\]]+)\]/g, ':$1*');

    if (!route.startsWith('/')) {
        route = '/' + route;
    }
    if (route === '') {
        route = '/';
    }
    return route;
}

/**
 * Map `import.meta.glob` keys like `../amapeji/index.bemba` or `.../amapeji/foo/bar.bemba` to a route path, or null (skip shell / unknown).
 * @param {string} globKey
 * @returns {string|null}
 */
function globKeyToPageRoute(globKey) {
    const normalized = String(globKey || '').replace(/\\/g, '/');
    const m = normalized.match(/(?:^|\/)amapeji\/(.+)\.bemba$/i);
    if (!m) return null;
    const rel = m[1].replace(/\\/g, '/');
    if (rel === 'umusango' || /^umusango-/.test(rel)) return null;
    return filePathToPageRoute(`${rel}.bemba`);
}

module.exports = {
    filePathToPageRoute,
    globKeyToPageRoute
};
