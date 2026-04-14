const fs = require('fs');
const path = require('path');
const BembaParser = require('../src/parser.js');

const root = path.resolve(__dirname, '../../../templates/base-project');
const shell = fs.readFileSync(path.join(root, 'amapeji', 'umusango.bemba'), 'utf8');
const page = `pangaIpepa('T', {
  umusangoSite: ee,
  ingisa: [ 'tailwind' ],
  umutwe: 'Hi',
  ilyashi: 'x'
})`;
const fp = path.join(root, 'amapeji', '_tw_smoke.bemba');
const pr = new BembaParser();
const html = pr.compile(page, { projectRoot: root, layoutCode: shell, pageFilePath: fp });
if (!html.includes('initBembaTailwindBridge')) throw new Error('missing tailwind bridge bootstrap');
if (!html.includes("prefix: 'tw-'")) throw new Error('missing prefix');
if (!html.includes('bemba-d1')) throw new Error('missing theme fontSize extend');
if (!html.includes('bemba-tw-prose')) throw new Error('missing Bemba+ layer');
if (!html.includes('tailwind.config.bemba')) throw new Error('missing bemba tailwind config loader');
if (!html.includes('pangaTailwind')) throw new Error('missing pangaTailwind parser bridge');
console.log('tw-bridge-smoke: ok');
