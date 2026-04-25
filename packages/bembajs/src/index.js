/**
 * Public SDK surface for bembajs.
 * React-first framework behavior is implemented in bembajs-core; this package re-exports
 * the stable APIs and adds framework metadata.
 */
const core = require('bembajs-core');
const wrappers = require('./wrappers');
const { version } = require('../package.json');

module.exports = {
    ...core,
    wrappers,
    framework: {
        name: 'bembajs',
        runtime: 'react',
        renderer: 'react-dom',
        routing: 'app-router'
    },
    version
};

module.exports.default = module.exports;
