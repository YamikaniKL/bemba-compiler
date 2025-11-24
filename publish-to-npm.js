#!/usr/bin/env node

/**
 * Publishing script for BembaJS packages
 * Publishes bembajs-core and bembajs to npm
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BembaJS Publishing Script\n');
console.log('Current npm user:', execSync('npm whoami', { encoding: 'utf-8' }).trim());
console.log('');

// Check if logged in
try {
    const whoami = execSync('npm whoami', { encoding: 'utf-8' }).trim();
    console.log(`✅ Logged in as: ${whoami}\n`);
} catch (error) {
    console.error('❌ Not logged in to npm!');
    console.error('Please run: npm login');
    process.exit(1);
}

// Verify versions
const bembajsCorePackage = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'packages/bembajs-core/package.json'), 'utf-8')
);
const bembajsPackage = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'packages/bembajs/package.json'), 'utf-8')
);

console.log('📦 Package Versions:');
console.log(`   bembajs-core: ${bembajsCorePackage.version}`);
console.log(`   bembajs: ${bembajsPackage.version}`);
console.log('');

// Check if dist folders exist
const coreDist = path.join(__dirname, 'packages/bembajs-core/dist');
const bembajsDist = path.join(__dirname, 'packages/bembajs/dist');

if (!fs.existsSync(coreDist)) {
    console.warn('⚠️  Warning: bembajs-core/dist not found. Building...');
    console.log('Building bembajs-core...');
    execSync('cd packages/bembajs-core && npm run build', { stdio: 'inherit' });
}

if (!fs.existsSync(bembajsDist)) {
    console.warn('⚠️  Warning: bembajs/dist not found. Building...');
    console.log('Building bembajs...');
    execSync('cd packages/bembajs && npm run build', { stdio: 'inherit' });
}

console.log('✅ Build folders exist\n');

// Ask for confirmation
console.log('📋 Ready to publish:');
console.log('   1. bembajs-core@' + bembajsCorePackage.version);
console.log('   2. bembajs@' + bembajsPackage.version);
console.log('');

// Get user confirmation
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Do you want to publish these packages to npm? (yes/no): ', (answer) => {
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
        console.log('❌ Publishing cancelled.');
        rl.close();
        process.exit(0);
    }

    console.log('\n🚀 Publishing packages...\n');

    try {
        // Publish bembajs-core first (dependency)
        console.log('📦 Publishing bembajs-core...');
        execSync('cd packages/bembajs-core && npm publish', { stdio: 'inherit' });
        console.log('✅ bembajs-core published!\n');

        // Publish bembajs
        console.log('📦 Publishing bembajs...');
        execSync('cd packages/bembajs && npm publish', { stdio: 'inherit' });
        console.log('✅ bembajs published!\n');

        console.log('🎉 All packages published successfully!');
        console.log('\n📦 Published:');
        console.log(`   - bembajs-core@${bembajsCorePackage.version}`);
        console.log(`   - bembajs@${bembajsPackage.version}`);
        console.log('\n🌐 View on npm:');
        console.log(`   https://www.npmjs.com/package/bembajs-core`);
        console.log(`   https://www.npmjs.com/package/bembajs`);

    } catch (error) {
        console.error('❌ Publishing failed:', error.message);
        process.exit(1);
    }

    rl.close();
});

