/**
 * Build script for bembajs package entrypoints.
 * Keeps CJS as source of truth, emits ESM and d.ts shims for export-map stability.
 */
const fs = require('fs');
const path = require('path');

const packageRoot = __dirname;
const srcDir = path.join(packageRoot, 'src');
const distDir = path.join(packageRoot, 'dist');

const entryFiles = ['index', 'cli', 'bun', 'server'];

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        ensureDir(dest);
        for (const entry of fs.readdirSync(src)) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
        return;
    }

    if (src.endsWith('.js')) {
        ensureDir(path.dirname(dest));
        fs.copyFileSync(src, dest);
        console.log(`  copied ${path.relative(packageRoot, src)}`);
    }
}

function writeEsmShim(name) {
    const esmPath = path.join(distDir, `${name}.mjs`);
    const content = `import cjsModule from './${name}.js';\nexport default cjsModule;\nexport * from './${name}.js';\n`;
    fs.writeFileSync(esmPath, content, 'utf8');
}

function writeTypeShim(name) {
    const dtsPath = path.join(distDir, `${name}.d.ts`);
    if (name === 'index') {
        const manual = path.join(packageRoot, 'src', 'index.d.ts');
        if (fs.existsSync(manual)) {
            fs.copyFileSync(manual, dtsPath);
            return;
        }
    }
    const content = `declare const value: any;\nexport = value;\n`;
    fs.writeFileSync(dtsPath, content, 'utf8');
}

function build() {
    console.log('Building bembajs...');

    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    ensureDir(distDir);

    copyRecursive(srcDir, distDir);

    for (const entry of entryFiles) {
        const jsPath = path.join(distDir, `${entry}.js`);
        if (!fs.existsSync(jsPath)) continue;
        writeEsmShim(entry);
        writeTypeShim(entry);
    }

    const scriptsSrc = path.join(packageRoot, 'scripts');
    const scriptsDest = path.join(distDir, 'scripts');
    if (fs.existsSync(scriptsSrc)) {
        ensureDir(scriptsDest);
        for (const entry of fs.readdirSync(scriptsSrc)) {
            if (!entry.endsWith('.js')) continue;
            fs.copyFileSync(path.join(scriptsSrc, entry), path.join(scriptsDest, entry));
            console.log(`  copied scripts/${entry}`);
        }
    }

    const devServerSrc = path.join(srcDir, 'server', 'dev-server.js');
    const devServerDist = path.join(distDir, 'dev-server.js');
    if (fs.existsSync(devServerSrc)) {
        fs.copyFileSync(devServerSrc, devServerDist);
        console.log('  copied src/server/dev-server.js to dist/dev-server.js');
    }

    console.log('bembajs built successfully.');
}

build();
