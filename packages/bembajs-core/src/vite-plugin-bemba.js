/**
 * Vite plugin: compile `.bemba` → React/JS via lexer → parser → transformer → generator.
 */
const path = require('path');
const fs = require('fs');
const BembaLexer = require('./lexer');
const BembaParser = require('./parser');
const BembaTransformer = require('./transformer');
const BembaGenerator = require('./generator');
const { ModuleNode } = require('./ast');
const { transformWithEsbuild } = require('vite');

function compileBembaFile(source, id) {
    const parser = new BembaParser();
    parser.tokens = new BembaLexer().tokenize(source);
    parser.current = 0;
    parser.errors = [];
    const program = parser.parseProgram();
    const rel = path.basename(id);
    const mod = new ModuleNode(rel, program);
    const transformed = new BembaTransformer().transform(mod);
    return new BembaGenerator().generate(transformed);
}

/**
 * @returns {import('vite').Plugin}
 */
function vitePluginBemba() {
    const bembaFilter = /\.bemba(?:\?.*)?$/;
    const bsxFilter = /\.bsx(?:\?.*)?$/;
    const cleanId = (id) => String(id || '').replace(/\?.*$/, '');
    return {
        name: 'vite-plugin-bemba',
        enforce: 'pre',
        async load(id) {
            if (!bembaFilter.test(id)) return null;
            const fileId = cleanId(id);
            let src = '';
            try {
                src = fs.readFileSync(fileId, 'utf8');
            } catch (e) {
                const msg = e && e.message ? e.message : String(e);
                throw new Error(`[vite-plugin-bemba] ${fileId}: ${msg}`);
            }
            try {
                const compiled = compileBembaFile(src, fileId);
                // Vite import analysis expects plain JS (not raw JSX) for custom extensions.
                const transformed = await transformWithEsbuild(compiled, id, {
                    loader: 'jsx',
                    jsx: 'automatic',
                    sourcemap: true
                });
                return {
                    code: transformed.code,
                    map: transformed.map || null
                };
            } catch (e) {
                const msg = e && e.message ? e.message : String(e);
                throw new Error(`[vite-plugin-bemba] ${fileId}: ${msg}`);
            }
        },
        async transform(src, id) {
            if (bsxFilter.test(id)) {
                const transformed = await transformWithEsbuild(src, id, {
                    loader: 'jsx',
                    jsx: 'automatic',
                    sourcemap: true
                });
                return {
                    code: transformed.code,
                    map: transformed.map || null
                };
            }
            if (bembaFilter.test(id)) return null;
            return null;
        }
    };
}

module.exports = { vitePluginBemba, compileBembaFile };
