/**
 * BembaJS - Main Package Entry Point
 * Exports SDK API and CLI functionality
 */

// Re-export core functionality
const core = require('@bembajs/core');

// Re-export SDK
const sdk = require('./sdk');

// Export everything
module.exports = {
    // Core compiler exports
    ...core,
    
    // SDK exports
    ...sdk,
    
    // Package info
    version: require('../package.json').version,
    name: 'bembajs'
};

// ESM default export
module.exports.default = module.exports;

