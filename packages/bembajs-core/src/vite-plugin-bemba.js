/**
 * Vite plugin: compile `.bemba` → React/JS via lexer → parser → transformer → generator.
 */
const path = require('path');
const fs = require('fs');
const BembaLexer = require('./lexer');
const BembaParser = require('./parser');
const BembaTransformer = require('./transformer');
const BembaGenerator = require('./generator');
const { ModuleNode } = require('./ast');
const { transformWithEsbuild } = require('vite');
const VIRTUAL_ENTRY_ID = 'virtual:bemba-app-entry';
const RESOLVED_VIRTUAL_ENTRY_ID = '\0virtual:bemba-app-entry';

function virtualEntrySource() {
    return `import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const appPages = import.meta.glob('/amapeji/app/**/page.bemba', { eager: true });
const legacyPages = import.meta.glob(
  ['/amapeji/**/*.bemba', '!/amapeji/umusango*.bemba', '!/amapeji/app/**'],
  { eager: true }
);

function filePathToPageRoute(filePath) {
  let route = String(filePath || '')
    .replace(/\\\\/g, '/')
    .replace(/\\.bemba$/, '')
    .replace(/^\\/?index$/, '')
    .replace(/\\/index$/, '/')
    .replace(/\\/$/, '');
  route = route.replace(/\\[([^\\]]+)\\]/g, ':$1');
  route = route.replace(/\\[\\.\\.\\.([^\\]]+)\\]/g, ':$1*');
  if (!route.startsWith('/')) route = '/' + route;
  if (route === '') route = '/';
  return route;
}

function toRoute(globKey) {
  const normalized = String(globKey || '').replace(/\\\\/g, '/');
  const appMatch = normalized.match(/\\/amapeji\\/app\\/(.+)\\/page\\.bemba$/i);
  if (appMatch) return filePathToPageRoute(appMatch[1] + '.bemba');
  const m = normalized.match(/\\/amapeji\\/(.+)\\.bemba$/i);
  if (!m) return null;
  const rel = m[1].replace(/^app\\//, '');
  if (rel === 'umusango' || /^umusango-/.test(rel)) return null;
  return filePathToPageRoute(rel + '.bemba');
}

function App() {
  const routes = [];
  const merged = { ...legacyPages, ...appPages };
  for (const [key, mod] of Object.entries(merged)) {
    const routePath = toRoute(key);
    if (routePath == null || !mod.default) continue;
    const Comp = mod.default;
    routes.push(React.createElement(Route, {
      key: routePath,
      path: routePath,
      element: React.createElement(Comp)
    }));
  }
  return React.createElement(
    Routes,
    null,
    ...routes,
    React.createElement(Route, {
      path: '*',
      element: React.createElement(Navigate, { to: '/', replace: true })
    })
  );
}

createRoot(document.getElementById('root')).render(
  React.createElement(BrowserRouter, null, React.createElement(App))
);
`;
}

function compileBembaFile(source, id) {
    const parser = new BembaParser();
    parser.tokens = new BembaLexer().tokenize(source);
    parser.current = 0;
    parser.errors = [];
    const program = parser.parseProgram();
    const rel = path.basename(id);
    const mod = new ModuleNode(rel, program);
    const transformed = new BembaTransformer().transform(mod);
    return new BembaGenerator().generate(transformed);
}

/**
 * @returns {import('vite').Plugin}
 */
function vitePluginBemba() {
    const bembaFilter = /\.bemba(?:\?.*)?$/;
    const bsxFilter = /\.bsx(?:\?.*)?$/;
    const cleanId = (id) => String(id || '').replace(/\?.*$/, '');
    return {
        name: 'vite-plugin-bemba',
        enforce: 'pre',
        resolveId(id) {
            if (id === VIRTUAL_ENTRY_ID) return RESOLVED_VIRTUAL_ENTRY_ID;
            return null;
        },
        async load(id) {
            if (id === RESOLVED_VIRTUAL_ENTRY_ID) {
                return {
                    code: virtualEntrySource(),
                    map: null
                };
            }
            if (!bembaFilter.test(id)) return null;
            const fileId = cleanId(id);
            let src = '';
            try {
                src = fs.readFileSync(fileId, 'utf8');
            } catch (e) {
                const msg = e && e.message ? e.message : String(e);
                throw new Error(`[vite-plugin-bemba] ${fileId}: ${msg}`);
            }
            try {
                const compiled = compileBembaFile(src, fileId);
                // Vite import analysis expects plain JS (not raw JSX) for custom extensions.
                const transformed = await transformWithEsbuild(compiled, id, {
                    loader: 'jsx',
                    jsx: 'automatic',
                    sourcemap: true
                });
                return {
                    code: transformed.code,
                    map: transformed.map || null
                };
            } catch (e) {
                const msg = e && e.message ? e.message : String(e);
                throw new Error(`[vite-plugin-bemba] ${fileId}: ${msg}`);
            }
        },
        async transform(src, id) {
            if (bsxFilter.test(id)) {
                const transformed = await transformWithEsbuild(src, id, {
                    loader: 'jsx',
                    jsx: 'automatic',
                    sourcemap: true
                });
                return {
                    code: transformed.code,
                    map: transformed.map || null
                };
            }
            if (bembaFilter.test(id)) return null;
            return null;
        },
        transformIndexHtml(html) {
            const raw = String(html || '');
            if (/src\/main\.(bsx|jsx|tsx|js)/i.test(raw)) return raw;
            if (raw.includes(VIRTUAL_ENTRY_ID)) return raw;
            const withRoot = raw.includes('id="root"')
                ? raw
                : raw.replace('</body>', '  <div id="root"></div>\n</body>');
            return withRoot.replace(
                '</body>',
                `  <script type="module" src="/@id/${VIRTUAL_ENTRY_ID}"></script>\n</body>`
            );
        }
    };
}

module.exports = { vitePluginBemba, compileBembaFile, VIRTUAL_ENTRY_ID };
