/**
 * Bare npm-style import specifiers → import map entries (esm.sh, pinned when possible).
 * Used by static HTML compile so `import x from 'react'` works in the browser with native ESM.
 */
const fs = require('fs');
const path = require('path');

function isHttpOrHttpsUrl(s) {
    return /^https?:\/\//i.test(String(s || '').trim());
}

/**
 * Root package id for a bare specifier: `react`, `lodash` from `lodash/map`, `@scope/pkg`.
 * Returns null if not a bare package path (relative, .bemba, empty, etc.).
 */
function packageRootFromBareSpecifier(source) {
    const s = String(source || '').trim();
    if (!s || s.startsWith('.') || isHttpOrHttpsUrl(s)) return null;
    if (/\.bemba$/i.test(s)) return null;
    if (/^[a-zA-Z]:[\\/]/.test(s)) return null;
    if (s.startsWith('file:') || s.startsWith('data:')) return null;
    if (s.startsWith('@')) {
        const m = s.match(/^(@[^/]+\/[^/]+)/);
        return m ? m[1] : null;
    }
    const i = s.indexOf('/');
    return i < 0 ? s : s.slice(0, i);
}

function readInstalledPackageVersion(projectRoot, pkgRoot) {
    if (!projectRoot || !pkgRoot) return null;
    const pj = path.join(path.resolve(projectRoot), 'node_modules', ...pkgRoot.split('/'), 'package.json');
    try {
        const v = JSON.parse(fs.readFileSync(pj, 'utf8')).version;
        return typeof v === 'string' && v.trim() ? v.trim() : null;
    } catch (_) {
        return null;
    }
}

function esmShBaseForPackage(projectRoot, pkgRoot) {
    const ver = readInstalledPackageVersion(projectRoot, pkgRoot);
    return ver ? `https://esm.sh/${pkgRoot}@${ver}` : `https://esm.sh/${pkgRoot}`;
}

/**
 * Build `<script type="importmap">` HTML for unique bare specifiers (npm / scoped).
 * HTTP(S) URL imports are unchanged by the browser and are omitted here.
 * @param {string|null} projectRoot
 * @param {Iterable<string>} bareSources - full specifier strings as written (`react`, `lodash/map`, …)
 * @returns {string} HTML fragment or empty string
 */
function buildImportMapScriptHtml(projectRoot, bareSources) {
    const roots = new Set();
    for (const src of bareSources || []) {
        const root = packageRootFromBareSpecifier(src);
        if (root) roots.add(root);
    }
    if (!roots.size) return '';

    const imports = {};
    const rootAbs = projectRoot ? path.resolve(projectRoot) : null;
    for (const root of Array.from(roots).sort()) {
        const base = rootAbs ? esmShBaseForPackage(rootAbs, root) : `https://esm.sh/${root}`;
        imports[root] = base;
        imports[`${root}/`] = `${base}/`;
    }

    const json = JSON.stringify({ imports }, null, 2);
    return `<script type="importmap">\n${json}\n</script>`;
}

/**
 * Absolute path to installed package.json for a bare specifier, if present.
 * @param {string} projectRoot
 * @param {string} source - import source string
 * @returns {string|null}
 */
function resolveNodeModulesPackageJson(projectRoot, source) {
    const root = packageRootFromBareSpecifier(source);
    if (!root || !projectRoot) return null;
    const pj = path.join(path.resolve(projectRoot), 'node_modules', ...root.split('/'), 'package.json');
    try {
        if (fs.existsSync(pj)) return path.normalize(pj);
    } catch (_) {
        /* ignore */
    }
    return null;
}

module.exports = {
    isHttpOrHttpsUrl,
    packageRootFromBareSpecifier,
    buildImportMapScriptHtml,
    resolveNodeModulesPackageJson
};
