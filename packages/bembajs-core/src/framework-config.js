const fs = require('fs');
const path = require('path');

/**
 * @param {string} projectRoot
 * @returns {{ reactSsrDev: boolean, reactApp: boolean }}
 */
function loadBembaFrameworkConfig(projectRoot) {
    const out = { reactSsrDev: true, reactApp: true };
    const root = path.resolve(projectRoot || process.cwd());
    const cfgPath = path.join(root, 'bemba.config.js');
    if (!fs.existsSync(cfgPath)) {
        return out;
    }
    try {
        const resolved = path.resolve(cfgPath);
        delete require.cache[resolved];
        const c = require(resolved);
        if (c && c.framework) {
            if (typeof c.framework.reactSsrDev === 'boolean') {
                out.reactSsrDev = c.framework.reactSsrDev;
            }
            if (typeof c.framework.reactApp === 'boolean') {
                out.reactApp = c.framework.reactApp;
            }
        }
    } catch (_) {
        /* keep defaults */
    }
    return out;
}

module.exports = { loadBembaFrameworkConfig };
