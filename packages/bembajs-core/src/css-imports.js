/**
 * Resolve `@import 'file.css';` in Bemba `imikalile` strings at compile time (trusted local files only).
 * @param {string} css
 * @param {string} baseDir - Directory containing the file that owns `css`
 * @param {Set<string>} [seen] - Absolute paths already inlined (cycle guard)
 * @returns {string}
 */
function resolveCssImports(css, baseDir, seen = new Set(), rootDir = null) {
    if (!css || !baseDir) return css || '';
    const fs = require('fs');
    const path = require('path');
    const base = path.resolve(baseDir);
    const rootNorm = rootDir ? path.resolve(rootDir) : null;
    const importRe = /@import\s+['"]([^'"]+)['"]\s*;/g;
    return String(css).replace(importRe, (full, rel) => {
        const abs = path.normalize(path.resolve(base, rel));
        if (rootNorm) {
            const relToRoot = path.relative(rootNorm, abs);
            if (relToRoot.startsWith('..') || path.isAbsolute(relToRoot)) {
                return `/* bemba: import outside project ${rel} */`;
            }
        }
        if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
            return `/* bemba: missing import ${rel} */`;
        }
        if (seen.has(abs)) {
            return `/* bemba: skip circular ${rel} */`;
        }
        seen.add(abs);
        let inner = '';
        try {
            inner = fs.readFileSync(abs, 'utf8');
        } catch (_) {
            return `/* bemba: read error ${rel} */`;
        }
        const dir = path.dirname(abs);
        return resolveCssImports(inner, dir, seen, rootNorm);
    });
}

module.exports = { resolveCssImports };
