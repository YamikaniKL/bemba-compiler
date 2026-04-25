const assert = require('node:assert');
const bembajs = require('../src/index.js');

assert.ok(typeof bembajs.compile === 'function', 'Expected compile() export');
assert.ok(typeof bembajs.framework === 'object', 'Expected framework metadata export');
assert.equal(bembajs.framework.runtime, 'react', 'Framework runtime should be react');

console.log('bembajs smoke tests passed');
