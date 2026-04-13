#!/usr/bin/env node
/**
 * Emit generated JSX/JS from .bemba files for wiring with Vite, esbuild, or Next.
 * Add framer-motion / CSS in your app — this step only dumps the compiler output.
 */
const fs = require('fs');
const path = require('path');

function run(opts = {}) {
    const cwd = process.cwd();
    const outDir = path.resolve(cwd, opts.outDir || 'dist/bemba-react');
    let core;
    try {
        core = require('bembajs-core');
    } catch (e) {
        console.error('bembajs-core is required. Install: npm install bembajs-core');
        process.exit(1);
    }
    const Parser = core.BembaParser;
    const Transformer = core.BembaTransformer;
    const Generator = core.BembaGenerator;
    const { BEMBA_FOLDERS } = core;

    function emitDir(rel) {
        const dir = path.join(cwd, rel);
        if (!fs.existsSync(dir)) {
            return;
        }
        for (const name of fs.readdirSync(dir)) {
            if (!name.endsWith('.bemba')) continue;
            const full = path.join(dir, name);
            const relOut = path.join(rel, name.replace(/\.bemba$/, '.jsx'));
            const dest = path.join(outDir, relOut);
            let generated;
            try {
                const parser = new Parser();
                parser.projectRoot = cwd;
                const ast = parser.parseFile(full);
                const transformed = new Transformer().transform(ast);
                generated = new Generator().generate(transformed);
            } catch (err) {
                console.warn(`Skip ${path.join(rel, name)}: ${err.message}`);
                continue;
            }
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            const banner = `/**\n * Generated from ${name}\n * Bundle with Vite/esbuild + React; use framer-motion or CSS for animation.\n * ${new Date().toISOString()}\n */\n`;
            fs.writeFileSync(dest, banner + generated, 'utf8');
            console.log('Wrote', path.relative(cwd, dest));
        }
    }

    fs.mkdirSync(outDir, { recursive: true });
    emitDir(BEMBA_FOLDERS.PAGES);
    emitDir(BEMBA_FOLDERS.COMPONENTS);
    emitDir(BEMBA_FOLDERS.API);
    emitDir('maapi');
    console.log('emit-react done →', path.relative(cwd, outDir));
}

module.exports = { run };

if (require.main === module) {
    const out = process.argv[2];
    run(out ? { outDir: out } : {});
}
