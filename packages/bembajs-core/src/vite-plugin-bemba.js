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
const { transformWithOxc, transformWithEsbuild } = require('vite');

/**
 * JSX transform for emitted `.bemba` JS. Prefer Oxc (Vite 6+) to avoid deprecated `transformWithEsbuild`.
 * @param {string} code
 * @param {string} id
 * @returns {Promise<{ code: string; map?: object | null }>}
 */
async function transformEmittedJsx(code, id) {
    if (typeof transformWithOxc === 'function') {
        return transformWithOxc(
            code,
            id,
            {
                lang: 'jsx',
                jsx: { runtime: 'automatic' },
                sourcemap: true
            },
            undefined,
            undefined,
            undefined
        );
    }
    return transformWithEsbuild(code, id, {
        loader: 'jsx',
        jsx: 'automatic',
        sourcemap: true
    });
}
// Client + server virtual entries (Vite SSR)
const VIRTUAL_CLIENT_ENTRY_ID = 'virtual:bemba-app-entry-client';
const RESOLVED_VIRTUAL_CLIENT_ENTRY_ID = '\0virtual:bemba-app-entry-client';
const VIRTUAL_SERVER_ENTRY_ID = 'virtual:bemba-app-entry-server';
const RESOLVED_VIRTUAL_SERVER_ENTRY_ID = '\0virtual:bemba-app-entry-server';
// Back-compat alias: older templates reference this id
const VIRTUAL_ENTRY_ID = 'virtual:bemba-app-entry';
const RESOLVED_VIRTUAL_ENTRY_ID = RESOLVED_VIRTUAL_CLIENT_ENTRY_ID;

function sharedRoutingSource() {
    // Keep this as a string block so both client and server entries stay in sync.
    return `
function stripRouteGroups(route) {
  const parts = String(route || '').split('/').filter(Boolean);
  return '/' + parts.filter(p => !/^\\(.+\\)$/.test(p)).join('/');
}

function filePathToPageRoute(filePath) {
  let route = String(filePath || '')
    .replace(/\\\\/g, '/')
    .replace(/\\.bemba$/, '')
    .replace(/^\\/?index$/, '')
    .replace(/\\/index$/, '/')
    .replace(/\\/$/, '');

  route = stripRouteGroups(route);

  // Order matters: catch-all first
  route = route.replace(/\\[\\.\\.\\.([^\\]]+)\\]/g, ':$1*');
  route = route.replace(/\\[([^\\]]+)\\]/g, ':$1');

  if (!route.startsWith('/')) route = '/' + route;
  if (route === '') route = '/';
  return route;
}

function keyToAppRoute(globKey) {
  const normalized = String(globKey || '').replace(/\\\\/g, '/');
  if (/\\/amapeji\\/app\\/page\\.bemba$/i.test(normalized)) return '/';
  const appMatch = normalized.match(/\\/amapeji\\/app\\/(.+)\\/page\\.bemba$/i);
  if (!appMatch) return null;
  return filePathToPageRoute(appMatch[1] + '.bemba');
}

function pageKeyToAppDir(globKey) {
  const normalized = String(globKey || '').replace(/\\\\/g, '/');
  if (/\\/amapeji\\/app\\/page\\.bemba$/i.test(normalized)) return '/amapeji/app';
  const m = normalized.match(/^(.*)\\/amapeji\\/app\\/(.+)\\/page\\.bemba$/i);
  if (!m) return null;
  return '/amapeji/app/' + m[2];
}

function resolveLayoutsForPageKey(pageKey) {
  const dir = pageKeyToAppDir(pageKey);
  if (!dir) return [];
  const parts = dir.split('/').filter(Boolean);
  // parts: ['amapeji','app', ...segments]
  const layouts = [];
  let cur = '/amapeji/app';
  const rootLayoutKey = cur + '/layout.bemba';
  if (appLayouts[rootLayoutKey]) layouts.push(rootLayoutKey);
  for (let i = 2; i < parts.length; i++) {
    cur += '/' + parts[i];
    const k = cur + '/layout.bemba';
    if (appLayouts[k]) layouts.push(k);
  }
  return layouts;
}

function resolveNearestNotFoundForPageKey(pageKey) {
  const dir = pageKeyToAppDir(pageKey);
  if (!dir) return null;
  const parts = dir.split('/').filter(Boolean);
  let cur = '/amapeji/app';
  let picked = appNotFounds[cur + '/not-found.bemba'] ? (cur + '/not-found.bemba') : null;
  for (let i = 2; i < parts.length; i++) {
    cur += '/' + parts[i];
    const k = cur + '/not-found.bemba';
    if (appNotFounds[k]) picked = k;
  }
  return picked;
}

function resolveNearestLoadingForPageKey(pageKey) {
  if (typeof appLoadings !== 'object' || appLoadings == null) return null;
  const dir = pageKeyToAppDir(pageKey);
  if (!dir) return null;
  const parts = dir.split('/').filter(Boolean);
  let cur = '/amapeji/app';
  let picked = appLoadings[cur + '/loading.bemba'] ? (cur + '/loading.bemba') : null;
  for (let i = 2; i < parts.length; i++) {
    cur += '/' + parts[i];
    const k = cur + '/loading.bemba';
    if (appLoadings[k]) picked = k;
  }
  return picked;
}

function matchDynamicRoute(requestPath, routePath) {
  const rSeg = String(routePath).split('/').filter(Boolean);
  const pSeg = String(requestPath).split('/').filter(Boolean);
  const params = {};
  let i = 0;
  for (; i < rSeg.length; i++) {
    const rs = rSeg[i];
    const ps = pSeg[i];
    if (rs == null) return null;
    if (rs.startsWith(':')) {
      const name = rs.slice(1);
      if (name.endsWith('*')) {
        const n = name.slice(0, -1);
        params[n] = pSeg.slice(i).join('/');
        return { params };
      }
      if (ps == null) return null;
      params[name] = ps;
      continue;
    }
    if (ps == null || rs !== ps) return null;
  }
  if (pSeg.length !== rSeg.length) return null;
  return { params };
}

function pickAppPageForPath(urlPath) {
  const entries = [];
  for (const [k, mod] of Object.entries(appPages)) {
    const routePath = keyToAppRoute(k);
    if (!routePath) continue;
    entries.push({ key: k, routePath, mod });
  }
  // Static first, then dynamic patterns.
  entries.sort((a, b) => {
    const ad = a.routePath.includes(':') ? 1 : 0;
    const bd = b.routePath.includes(':') ? 1 : 0;
    if (ad !== bd) return ad - bd;
    // More specific first (more segments, fewer params)
    const aSeg = a.routePath.split('/').length;
    const bSeg = b.routePath.split('/').length;
    return bSeg - aSeg;
  });
  for (const e of entries) {
    if (!e.routePath.includes(':')) {
      if (e.routePath === urlPath) return { ...e, params: {} };
      continue;
    }
    const m = matchDynamicRoute(urlPath, e.routePath);
    if (m) return { ...e, params: m.params || {} };
  }
  return null;
}

function pickLegacyPageForPath(urlPath) {
  // Best-effort: legacy pages are file-based, no nested layouts.
  // Map \`/about\` -> \`/amapeji/about.bemba\` and \`/\` -> \`/amapeji/index.bemba\` if present.
  const want = urlPath === '/' ? '/amapeji/index.bemba' : ('/amapeji' + urlPath + '.bemba');
  const mod = legacyPages[want];
  if (mod) return { key: want, mod, params: {} };
  return null;
}
`;
}

function virtualClientEntrySource() {
    return `import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
/* global.css is linked from index HTML so Tailwind is render-blocking before this entry runs */

const appPages = import.meta.glob('/amapeji/app/**/page.bemba');
const appLayouts = import.meta.glob('/amapeji/app/**/layout.bemba', { eager: true });
const appNotFounds = import.meta.glob('/amapeji/app/**/not-found.bemba', { eager: true });
const appLoadings = import.meta.glob('/amapeji/app/**/loading.bemba', { eager: true });
const legacyPages = import.meta.glob(
  ['/amapeji/**/*.bemba', '!/amapeji/umusango*.bemba', '!/amapeji/app/**'],
  { eager: true }
);

${sharedRoutingSource()}

let __bembaRoot = null;
let __bembaHydrated = false;

function getRoot(rootEl) {
  if (__bembaRoot) return __bembaRoot;
  __bembaRoot = createRoot(rootEl);
  return __bembaRoot;
}

function composeElement(pageKey, PageComp) {
  const layouts = resolveLayoutsForPageKey(pageKey);
  let node = React.createElement(PageComp);
  for (let i = layouts.length - 1; i >= 0; i--) {
    const Layout = appLayouts[layouts[i]] && appLayouts[layouts[i]].default;
    if (typeof Layout !== 'function') continue;
    node = React.createElement(Layout, { children: node });
  }
  return node;
}

async function loadMaybe(modOrLoader) {
  if (!modOrLoader) return null;
  if (typeof modOrLoader === 'function') {
    try { return await modOrLoader(); } catch (_) { return null; }
  }
  return modOrLoader;
}

function renderLoadingFor(pageKey) {
  const rootEl = document.getElementById('root');
  const loadingKey = resolveNearestLoadingForPageKey(pageKey) || '/amapeji/app/loading.bemba';
  const Loading = appLoadings[loadingKey] && appLoadings[loadingKey].default;
  if (typeof Loading === 'function') {
    getRoot(rootEl).render(React.createElement(Loading));
    return;
  }
  // Minimal fallback
  getRoot(rootEl).render(React.createElement('div', null, 'Loading...'));
}

async function renderUrl(urlPath) {
  const rootEl = document.getElementById('root');
  const pickedApp = pickAppPageForPath(urlPath);
  if (pickedApp) {
    const state = window.__BEMBA_SSR_STATE__;
    const shouldHydrate = state && state.urlPath === urlPath && state.ssr === true && rootEl && rootEl.hasChildNodes();
    if (!shouldHydrate) {
      renderLoadingFor(pickedApp.key);
    }
    const loaded = await loadMaybe(pickedApp.mod);
    const Page = loaded && loaded.default;
    if (typeof Page !== 'function') {
      // fallthrough to not-found
    } else {
    const element = composeElement(pickedApp.key, Page);
    if (shouldHydrate) {
      if (!__bembaHydrated) {
        __bembaRoot = hydrateRoot(rootEl, element);
        __bembaHydrated = true;
      } else {
        getRoot(rootEl).render(element);
      }
    } else {
      getRoot(rootEl).render(element);
    }
    return;
    }
  }
  const pickedLegacy = pickLegacyPageForPath(urlPath);
  if (pickedLegacy) {
    const Comp = pickedLegacy.mod && pickedLegacy.mod.default;
    if (typeof Comp === 'function') {
      getRoot(rootEl).render(React.createElement(Comp));
      return;
    }
    return;
  }
  const nfKey = '/amapeji/app/not-found.bemba';
  if (appNotFounds[nfKey] && appNotFounds[nfKey].default) {
    const NotFound = appNotFounds[nfKey].default;
    getRoot(rootEl).render(React.createElement(NotFound));
    return;
  }
  getRoot(rootEl).render(React.createElement('div', null, 'Not Found'));
}

function hijackLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
    if (a.getAttribute('target') === '_blank') return;
    e.preventDefault();
    history.pushState(null, '', href);
    renderUrl(location.pathname || '/');
  });
  window.addEventListener('popstate', () => renderUrl(location.pathname || '/'));
}

hijackLinks();
renderUrl(location.pathname || '/');
`;
}

function virtualServerEntrySource() {
    return `import React from 'react';
import { renderToString } from 'react-dom/server';
import '/imikalile/global.css';

const appPages = import.meta.glob('/amapeji/app/**/page.bemba', { eager: true });
const appLayouts = import.meta.glob('/amapeji/app/**/layout.bemba', { eager: true });
const appNotFounds = import.meta.glob('/amapeji/app/**/not-found.bemba', { eager: true });
const appLoadings = import.meta.glob('/amapeji/app/**/loading.bemba', { eager: true });
const legacyPages = import.meta.glob(
  ['/amapeji/**/*.bemba', '!/amapeji/umusango*.bemba', '!/amapeji/app/**'],
  { eager: true }
);

${sharedRoutingSource()}

function composeElement(pageKey, PageComp) {
  const layouts = resolveLayoutsForPageKey(pageKey);
  let node = React.createElement(PageComp);
  for (let i = layouts.length - 1; i >= 0; i--) {
    const Layout = appLayouts[layouts[i]] && appLayouts[layouts[i]].default;
    if (typeof Layout !== 'function') continue;
    node = React.createElement(Layout, { children: node });
  }
  return node;
}

export async function render(url) {
  const u = new URL(url, 'http://localhost');
  const urlPath = u.pathname || '/';

  const pickedApp = pickAppPageForPath(urlPath);
  if (pickedApp) {
    const Page = pickedApp.mod && pickedApp.mod.default;
    const element = composeElement(pickedApp.key, Page);
    const html = renderToString(element);
    return { html, state: { ssr: true, urlPath } };
  }

  const pickedLegacy = pickLegacyPageForPath(urlPath);
  if (pickedLegacy) {
    const Comp = pickedLegacy.mod && pickedLegacy.mod.default;
    const html = renderToString(React.createElement(Comp));
    return { html, state: { ssr: true, urlPath } };
  }

  const nfKey = '/amapeji/app/not-found.bemba';
  if (appNotFounds[nfKey] && appNotFounds[nfKey].default) {
    const NotFound = appNotFounds[nfKey].default;
    const html = renderToString(React.createElement(NotFound));
    return { html, state: { ssr: true, urlPath, notFound: true } };
  }

  return { html: '<div>Not Found</div>', state: { ssr: true, urlPath, notFound: true } };
}
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
            if (id === VIRTUAL_CLIENT_ENTRY_ID) return RESOLVED_VIRTUAL_CLIENT_ENTRY_ID;
            if (id === VIRTUAL_SERVER_ENTRY_ID) return RESOLVED_VIRTUAL_SERVER_ENTRY_ID;
            return null;
        },
        async load(id) {
            if (id === RESOLVED_VIRTUAL_CLIENT_ENTRY_ID) {
                return {
                    code: virtualClientEntrySource(),
                    map: null
                };
            }
            if (id === RESOLVED_VIRTUAL_SERVER_ENTRY_ID) {
                return {
                    code: virtualServerEntrySource(),
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
                const transformed = await transformEmittedJsx(compiled, id);
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
                const transformed = await transformEmittedJsx(src, id);
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

            // Browsers cannot load `virtual:` URLs. Managed `injini-index.html` used a bare
            // `src="virtual:bemba-app-entry-client"`; normalize to Vite's /@id/ form (dev + build).
            const viteClientSrc = `/@id/${VIRTUAL_CLIENT_ENTRY_ID}`;
            const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            let out = raw.replace(/\r\n/g, '\n');
            for (const vid of [VIRTUAL_CLIENT_ENTRY_ID, VIRTUAL_ENTRY_ID]) {
                out = out.replace(new RegExp(`src=(["'])${escRe(vid)}\\1`, 'gi'), `src=$1${viteClientSrc}$1`);
            }

            if (!out.includes(viteClientSrc)) {
                const withRoot = out.includes('id="root"')
                    ? out
                    : out.replace('</body>', '  <div id="root"></div>\n</body>');
                out = withRoot.replace(
                    '</body>',
                    `  <script type="module" src="${viteClientSrc}"></script>\n</body>`
                );
            }

            // Render-blocking Tailwind entry: avoids FOUC when global.css was only imported from JS.
            if (
                out.includes(viteClientSrc) &&
                !/\/imikalile\/global\.css/i.test(out)
            ) {
                out = out.replace('</head>', '  <link rel="stylesheet" href="/imikalile/global.css" />\n</head>');
            }

            return out;
        }
    };
}

module.exports = {
    vitePluginBemba,
    compileBembaFile,
    VIRTUAL_ENTRY_ID,
    VIRTUAL_CLIENT_ENTRY_ID,
    VIRTUAL_SERVER_ENTRY_ID
};
