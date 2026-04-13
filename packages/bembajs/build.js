/**
 * Build script for bembajs
 */

const fs = require('fs');
const path = require('path');

console.log('Building bembajs...');

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
        console.log(`  copied ${path.relative(__dirname, src)}`);
    }
}

copyRecursive(srcDir, distDir);

// Copy the updated dev-server.js from server folder to root dist
const updatedDevServer = path.join(srcDir, 'server', 'dev-server.js');
const distDevServer = path.join(distDir, 'dev-server.js');
if (fs.existsSync(updatedDevServer)) {
    fs.copyFileSync(updatedDevServer, distDevServer);
    console.log('  copied src/server/dev-server.js to dist/dev-server.js');
}

const scriptsSrc = path.join(__dirname, 'scripts');
const scriptsDest = path.join(distDir, 'scripts');
if (fs.existsSync(scriptsSrc)) {
    if (!fs.existsSync(scriptsDest)) {
        fs.mkdirSync(scriptsDest, { recursive: true });
    }
    for (const entry of fs.readdirSync(scriptsSrc)) {
        if (entry.endsWith('.js')) {
            fs.copyFileSync(path.join(scriptsSrc, entry), path.join(scriptsDest, entry));
            console.log(`  copied scripts/${entry}`);
        }
    }
}

console.log('bembajs built successfully.');
