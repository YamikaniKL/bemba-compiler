/**
 * SSR module loader for generated `.bemba` React pages.
 *
 * Goals:
 * - Support full JS import grammar (via esbuild transform to CJS)
 * - Unify import resolution between Vite + SSR + static builds:
 *   - relative imports without extension → `.bemba`
 *   - `.bemba` can be required/imported and is compiled on the fly
 *   - bare specifiers are delegated to Node resolution (`require('react')`, etc.)
 */
const vm = require('vm');
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const BembaLexer = require('./lexer');
const BembaParser = require('./parser');
const BembaTransformer = require('./transformer');
const BembaGenerator = require('./generator');

/**
 * @param {string} source
 * @param {string} filename
 */
function transpileJsxEsmToCjs(source, filename) {
    const out = esbuild.transformSync(String(source || ''), {
        sourcefile: filename,
        loader: 'jsx',
        jsx: 'automatic',
        format: 'cjs',
        platform: 'node',
        target: 'node16',
        sourcemap: 'inline'
    });
    return out.code;
}

/**
 * Execute CJS code in a vm context and return `module.exports`.
 * @param {string} cjsCode
 * @param {string} filename
 * @param {(id: string) => any} req
 */
function runCjsModule(cjsCode, filename, req) {
    const module = { exports: {} };
    const dirname = path.dirname(path.resolve(filename));
    const wrapped = `(function (exports, require, module, __filename, __dirname) {\n"use strict";\n${cjsCode}\n});`;
    const script = new vm.Script(wrapped, { filename: path.basename(filename) });
    const fn = script.runInThisContext();
    fn(module.exports, req, module, path.resolve(filename), dirname);
    return module.exports;
}

/** @returns {string|null} absolute path if it looks like a bemba file */
function resolveMaybeBembaFile(parentFilename, request) {
    const id = String(request || '');
    if (!id) return null;
    if (!id.startsWith('.')) return null;
    const parentDir = path.dirname(path.resolve(parentFilename));
    let resolved = path.resolve(parentDir, id);
    if (!path.extname(resolved)) {
        resolved += '.bemba';
    }
    if (resolved.endsWith('.bemba') && fs.existsSync(resolved)) {
        return resolved;
    }
    return null;
}

/**
 * Create a `require` function that can compile `.bemba` modules on the fly.
 * @param {{ projectRoot?: string, filename: string }} opts
 */
function createSsrRequire(opts) {
    const parentFilename = opts && opts.filename ? opts.filename : process.cwd();
    const projectRoot = opts && opts.projectRoot ? String(opts.projectRoot) : '';
    /** @type {Map<string, { mtimeMs: number, exports: any }>} */
    const cache = createSsrRequire._cache || (createSsrRequire._cache = new Map());

    /** @param {string} id */
    const ssrRequire = (id) => {
        const maybe = resolveMaybeBembaFile(parentFilename, id);
        if (!maybe) {
            return require(id);
        }
        const abs = path.normalize(maybe);
        const mtimeMs = fs.statSync(abs).mtimeMs;
        const hit = cache.get(abs);
        if (hit && hit.mtimeMs === mtimeMs) {
            return hit.exports;
        }

        const bembaSrc = fs.readFileSync(abs, 'utf8');
        const parser = new BembaParser();
        parser.projectRoot = projectRoot || '';
        const tokens = new BembaLexer().tokenize(bembaSrc);
        const ast = parser.parse(tokens);
        const transformed = new BembaTransformer().transform(ast);
        const generated = new BembaGenerator().generate(transformed);
        const cjs = transpileJsxEsmToCjs(generated, abs);

        const childRequire = createSsrRequire({ projectRoot, filename: abs });
        const exports = runCjsModule(cjs, abs, childRequire);
        cache.set(abs, { mtimeMs, exports });
        return exports;
    };

    return ssrRequire;
}

/**
 * Load a React component from generated Bemba page source (ESM/JSX string).
 * @param {string} esmSource
 * @param {string} [filenameHint]
 * @param {{ projectRoot?: string }} [opts]
 * @returns {import('react').ComponentType<any>}
 */
function loadDefaultExportPageComponent(esmSource, filenameHint = 'bemba-page.generated.jsx', opts = {}) {
    const cjs = transpileJsxEsmToCjs(esmSource, filenameHint);
    const req = createSsrRequire({ projectRoot: opts.projectRoot || '', filename: filenameHint });
    const exports = runCjsModule(cjs, filenameHint, req);
    const C = exports && (exports.default || exports);
    if (typeof C !== 'function') {
        throw new Error('SSR: default export is not a function component');
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
    const Comp = loadDefaultExportPageComponent(generatedJs, opts.filePath || 'bemba-page.generated.jsx', {
        projectRoot: opts.projectRoot
    });
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
    const Page = loadDefaultExportPageComponent(pageGeneratedJs, opts.filePath || 'bemba-page.generated.jsx', {
        projectRoot: opts.projectRoot
    });
    let node = React.createElement(Page);
    // `layoutGenerated` is ordered root -> leaf. To wrap correctly, apply from leaf -> root.
    for (let i = layoutGenerated.length - 1; i >= 0; i--) {
        const layoutComp = loadDefaultExportPageComponent(
            layoutGenerated[i],
            `${opts.filePath || 'bemba-page'}.layout.${i}.jsx`
            ,
            { projectRoot: opts.projectRoot }
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
