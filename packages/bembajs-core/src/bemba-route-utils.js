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

/**
 * App-router mapping for files ending with `amapeji/app/<segments>/page.bemba`.
 * Example:
 * - `amapeji/app/page.bemba` -> `/`
 * - `amapeji/app/about/page.bemba` -> `/about`
 * - `amapeji/app/blog/[id]/page.bemba` -> `/blog/:id`
 * @param {string} filePathAbsOrRel
 * @returns {string|null}
 */
function appPageFileToRoute(filePathAbsOrRel) {
    const normalized = String(filePathAbsOrRel || '').replace(/\\/g, '/');
    if (/(?:^|\/)amapeji\/app\/page\.bemba$/i.test(normalized)) {
        return '/';
    }
    const m = normalized.match(/(?:^|\/)amapeji\/app\/(.+)\/page\.bemba$/i);
    if (!m) return null;
    return filePathToPageRoute(`${m[1]}.bemba`);
}

/**
 * Find app-router layouts that apply to a page.
 * Returns nearest-first order from root to leaf.
 * @param {string} pageFilePath
 * @returns {string[]}
 */
function resolveAppLayoutsForPage(pageFilePath) {
    const normalized = String(pageFilePath || '').replace(/\\/g, '/');
    const m = normalized.match(/^(.*\/amapeji\/app)(?:\/(.+))\/page\.bemba$/i);
    if (!m) return [];
    const appRoot = m[1];
    const relDir = m[2] || '';
    const parts = relDir ? relDir.split('/').filter(Boolean) : [];
    const layouts = [];
    layouts.push(`${appRoot}/layout.bemba`);
    let cur = appRoot;
    for (const p of parts) {
        cur += `/${p}`;
        layouts.push(`${cur}/layout.bemba`);
    }
    return layouts;
}

module.exports = {
    filePathToPageRoute,
    globKeyToPageRoute,
    appPageFileToRoute,
    resolveAppLayoutsForPage
};
