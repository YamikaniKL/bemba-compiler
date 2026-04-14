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
    const filter = /\.bemba$/;
    return {
        name: 'vite-plugin-bemba',
        enforce: 'pre',
        async load(id) {
            if (!filter.test(id)) return null;
            let src = '';
            try {
                src = fs.readFileSync(id, 'utf8');
            } catch (e) {
                const msg = e && e.message ? e.message : String(e);
                throw new Error(`[vite-plugin-bemba] ${id}: ${msg}`);
            }
            try {
                const compiled = compileBembaFile(src, id);
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
                throw new Error(`[vite-plugin-bemba] ${id}: ${msg}`);
            }
        },
        transform(_src, id) {
            if (!filter.test(id)) return null;
            // `load()` already returns compiled JS for `.bemba`.
            return null;
        }
    };
}

module.exports = { vitePluginBemba, compileBembaFile };
