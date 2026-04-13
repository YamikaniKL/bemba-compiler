/**
 * Load generated ESM-style API modules (export default async function handler...)
 * as a real Node function using vm. Handlers run with project require() so you can
 * use pg, mysql2, etc. from npm in the Bemba handler body.
 */
const vm = require('vm');
const path = require('path');

/**
 * @param {string} esmSource - Output of BembaGenerator.generateApiHandler / generateModule for pangaApi
 * @param {string} [filenameHint] - For stack traces
 * @returns {import('http').RequestListener}
 */
function loadApiHandlerFromGeneratedSource(esmSource, filenameHint = 'bemba-api.generated.js') {
    const trimmed = String(esmSource || '').trim();
    let body = trimmed
        .replace(/^\s*export\s+default\s+async\s+function\s+handler\b/m, 'async function handler')
        .replace(/^\s*export\s+default\s+function\s+handler\b/m, 'function handler');
    if (body === trimmed) {
        throw new Error(
            'Generated API module must export default function handler(req, res). Regenerate from pangaApi(...).'
        );
    }
    const wrapped = `"use strict";\n${body}\n;module.exports = handler;\n`;
    const module = { exports: {} };
    const dirname = path.dirname(path.resolve(filenameHint));
    const sandbox = {
        module,
        exports: module.exports,
        require,
        console,
        process,
        Buffer,
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval,
        __filename: path.resolve(filenameHint),
        __dirname: dirname
    };
    vm.createContext(sandbox);
    vm.runInContext(wrapped, sandbox, { filename: path.basename(filenameHint) });
    const fn = module.exports;
    if (typeof fn !== 'function') {
        throw new Error('API loader: handler is not a function after compile');
    }
    return fn;
}

module.exports = { loadApiHandlerFromGeneratedSource };
