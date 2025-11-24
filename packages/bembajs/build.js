/**
 * Build script for bembajs
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 Building bembajs...');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy source files to dist
const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir, { recursive: true });

function copyRecursive(src, dest) {
    if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        const entries = fs.readdirSync(src);
        entries.forEach(entry => {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        });
    } else if (src.endsWith('.js')) {
        fs.copyFileSync(src, dest);
        console.log(`  ✓ Copied ${path.relative(__dirname, src)}`);
    }
}

copyRecursive(srcDir, distDir);

// Copy the updated dev-server.js from server folder to root dist
const updatedDevServer = path.join(srcDir, 'server', 'dev-server.js');
const distDevServer = path.join(distDir, 'dev-server.js');
if (fs.existsSync(updatedDevServer)) {
    fs.copyFileSync(updatedDevServer, distDevServer);
    console.log('  ✓ Copied src/server/dev-server.js to dist/dev-server.js');
}

console.log('✅ bembajs built successfully!');
