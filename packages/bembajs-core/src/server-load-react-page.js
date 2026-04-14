/**
 * Dev SSR: execute generated ESM-style React page (from BembaGenerator) with vm + require('react').
 * Only the built-in React import line is supported; other imports cause a clear error (caller may fall back).
 */
const vm = require('vm');
const path = require('path');

/**
 * Strip the generator's `import React, { … } from 'react'` / `import React from 'react'` and prepend CJS requires.
 * @param {string} esmSource
 * @returns {string}
 */
function stripReactImportPrependRequire(esmSource) {
    const lines = String(esmSource || '').split('\n');
    const rest = [];
    for (const line of lines) {
        const t = line.trim();
        if (/^import React, \{[^}]+\} from\s*['"]react['"]\s*;?\s*$/.test(t)) continue;
        if (/^import React from\s*['"]react['"]\s*;?\s*$/.test(t)) continue;
        if (/^import\s/.test(t) && /\sfrom\s['"]/.test(t)) {
            throw new Error(
                `Dev SSR only supports pages whose generated code imports React from 'react' (found: ${t.slice(0, 120)})`
            );
        }
        rest.push(line);
    }
    const hooks = 'useState, useEffect, useContext, useRef, useReducer, useMemo, useCallback';
    return `const React = require('react');
const { ${hooks} } = React;
${rest.join('\n')}`;
}

/**
 * @param {string} esmSource
 * @param {string} [filenameHint]
 * @returns {import('react').ComponentType<any>}
 */
function loadDefaultExportPageComponent(esmSource, filenameHint = 'bemba-page.generated.jsx') {
    let body = stripReactImportPrependRequire(esmSource);
    body = body.replace(/\bexport\s+default\s+(\w+)\s*;?\s*$/m, 'module.exports.default = $1;');
    if (!/module\.exports\.default\s*=/.test(body)) {
        throw new Error('Dev SSR: generated page must end with export default <ComponentName>');
    }
    const wrapped = `"use strict";\n${body}\n`;
    const module = { exports: {} };
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
        __dirname: path.dirname(path.resolve(filenameHint))
    };
    vm.createContext(sandbox);
    vm.runInContext(wrapped, sandbox, { filename: path.basename(filenameHint) });
    const C = module.exports.default;
    if (typeof C !== 'function') {
        throw new Error('Dev SSR: default export is not a function component');
    }
    return C;
}

/**
 * @param {string} generatedJs - output of BembaGenerator.generate(transformedModule)
 * @param {{ title?: string, filePath?: string }} [opts]
 * @returns {string} HTML fragment (outer `<div id="root">…</div>` wrapper applied by dev-server)
 */
function renderBembaPageToHtmlString(generatedJs, opts = {}) {
    const React = require('react');
    const ReactDOMServer = require('react-dom/server');
    const Comp = loadDefaultExportPageComponent(generatedJs, opts.filePath || 'bemba-page.generated.jsx');
    return ReactDOMServer.renderToString(React.createElement(Comp));
}

/**
 * Render app-router page with optional nested layouts.
 * `layoutGenerated` should be ordered from root layout to nearest layout.
 * @param {string} pageGeneratedJs
 * @param {string[]} layoutGenerated
 * @param {{ filePath?: string }} [opts]
 * @returns {string}
 */
function renderBembaAppRouteToHtmlString(pageGeneratedJs, layoutGenerated = [], opts = {}) {
    const React = require('react');
    const ReactDOMServer = require('react-dom/server');
    const Page = loadDefaultExportPageComponent(pageGeneratedJs, opts.filePath || 'bemba-page.generated.jsx');
    let node = React.createElement(Page);
    for (let i = 0; i < layoutGenerated.length; i++) {
        const layoutComp = loadDefaultExportPageComponent(
            layoutGenerated[i],
            `${opts.filePath || 'bemba-page'}.layout.${i}.jsx`
        );
        node = React.createElement(layoutComp, { children: node });
    }
    return ReactDOMServer.renderToString(node);
}

module.exports = {
    renderBembaPageToHtmlString,
    renderBembaAppRouteToHtmlString,
    loadDefaultExportPageComponent
};
