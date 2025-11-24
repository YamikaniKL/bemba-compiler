#!/usr/bin/env node

/**
 * BembaJS CLI Entry Point
 * Auto-detects runtime (Node.js vs Bun) and uses optimized path
 */

// Detect runtime
const isBun = typeof Bun !== 'undefined';
const runtime = isBun ? 'bun' : 'node';

// Display runtime info in debug mode
if (process.env.DEBUG) {
    console.log(`🚀 BembaJS CLI running on ${runtime}`);
}

// Load appropriate entry point
if (isBun) {
    // Use Bun-optimized path
    require('../dist/bun.js');
} else {
    // Use standard Node.js path
    require('../dist/cli.js');
}

