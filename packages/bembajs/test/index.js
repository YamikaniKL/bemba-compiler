const assert = require('node:assert');
const bembajs = require('../src/index.js');

assert.ok(typeof bembajs.compile === 'function', 'Expected compile() export');
assert.ok(typeof bembajs.createDevServer === 'function', 'Expected createDevServer() export');
assert.ok(typeof bembajs.build === 'function', 'Expected build() export');
assert.ok(typeof bembajs.cindika === 'function', 'Expected cindika() Bemba alias export');
assert.ok(typeof bembajs.tungulula === 'function', 'Expected tungulula() Bemba alias export');
assert.ok(typeof bembajs.akha === 'function', 'Expected akha() Bemba alias export');
assert.ok(typeof bembajs.fumya === 'function', 'Expected fumya() Bemba alias export');
assert.ok(typeof bembajs.framework === 'object', 'Expected framework metadata export');
assert.equal(bembajs.framework.runtime, 'react', 'Framework runtime should be react');

console.log('bembajs smoke tests passed');
