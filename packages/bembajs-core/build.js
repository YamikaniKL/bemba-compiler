/**
 * Build script for bembajs-core.
 * Copies source files to dist and creates ESM/.d.ts entry shims.
 */
const fs = require('fs');
const path = require('path');

const packageRoot = __dirname;
const srcDir = path.join(packageRoot, 'src');
const distDir = path.join(packageRoot, 'dist');

const entryFiles = ['index', 'lexer', 'parser', 'transformer', 'generator', 'constants', 'ast', 'runtime', 'router', 'cli', 'build', 'app', 'dev-server'];
const typedEntries = ['index', 'lexer', 'parser', 'transformer', 'generator'];

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        ensureDir(dest);
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
        return;
    }

    if (src.endsWith('.js')) {
        ensureDir(path.dirname(dest));
        fs.copyFileSync(src, dest);
        console.log(`  ✓ Copied ${path.relative(packageRoot, src)}`);
    }
}

function writeEsmShim(name) {
    const esmPath = path.join(distDir, `${name}.mjs`);
    const content = `import cjsModule from './${name}.js';\nexport default cjsModule;\nexport * from './${name}.js';\n`;
    fs.writeFileSync(esmPath, content, 'utf8');
}

function writeTypeShim(name) {
    const dtsPath = path.join(distDir, `${name}.d.ts`);
    const content = `declare const value: any;\nexport = value;\n`;
    fs.writeFileSync(dtsPath, content, 'utf8');
}

function build() {
    console.log('🔨 Building bembajs-core...');

    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    ensureDir(distDir);

    copyRecursive(srcDir, distDir);

    for (const entry of entryFiles) {
        const jsPath = path.join(distDir, `${entry}.js`);
        if (fs.existsSync(jsPath)) {
            writeEsmShim(entry);
        }
    }

    for (const entry of typedEntries) {
        const jsPath = path.join(distDir, `${entry}.js`);
        if (fs.existsSync(jsPath)) {
            writeTypeShim(entry);
        }
    }

    console.log('✅ bembajs-core built successfully!');
}

build();
