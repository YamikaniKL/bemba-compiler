/**
 * BembaJS Build System
 */

const fs = require('fs');
const path = require('path');
const { compile } = require('@bembajs/core');

/**
 * Build project for production
 */
async function build(options = {}) {
    const outputDir = options.output || 'dist';
    
    console.log('🔨 Building BembaJS project...');
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Build pages
    const pagesDir = path.join(process.cwd(), 'amapeji');
    if (fs.existsSync(pagesDir)) {
        const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.bemba'));
        
        for (const page of pages) {
            const pagePath = path.join(pagesDir, page);
            const code = fs.readFileSync(pagePath, 'utf-8');
            const result = compile(code);
            
            const outputPath = path.join(outputDir, page.replace('.bemba', '.html'));
            fs.writeFileSync(outputPath, result);
            
            console.log(`  ✓ Built ${page}`);
        }
    }
    
    console.log('✅ Build complete!');
    
    return { success: true, outputDir };
}

/**
 * Bundle project files
 */
async function bundle(options = {}) {
    console.log('📦 Bundling BembaJS project...');
    
    // Bundling logic here
    
    return { success: true };
}

/**
 * Optimize built project
 */
async function optimize(options = {}) {
    console.log('⚡ Optimizing BembaJS project...');
    
    // Optimization logic here
    
    return { success: true };
}

module.exports = {
    build,
    bundle,
    optimize
};

