const fs = require('fs');
const path = require('path');
const { BEMBA_FOLDERS } = require('./constants');
const BembaRouter = require('./router');
const BembaParser = require('./parser');
const { generateSitemapXml, generateRssFeedXml } = require('./static-site-helpers');

const BEMBA_SITE_JS = path.join(__dirname, 'bemba-site.js');
const CACHE_FILE_REL = path.join('.bemba', 'cache', 'static-export.json');

/** @param {string[]} depPaths */
function snapshotDepMtimes(depPaths) {
    const mtimes = {};
    for (const p of depPaths || []) {
        try {
            if (fs.existsSync(p)) {
                mtimes[p] = fs.statSync(p).mtimeMs;
            }
        } catch (_) {
            /* ignore */
        }
    }
    return mtimes;
}

/** @param {string[]} depPaths @param {Record<string, number>} mtimes */
function depsStillFresh(depPaths, mtimes) {
    if (!depPaths || !mtimes || depPaths.length === 0) return false;
    for (const p of depPaths) {
        try {
            if (!fs.existsSync(p)) return false;
            if (fs.statSync(p).mtimeMs !== mtimes[p]) return false;
        } catch (_) {
            return false;
        }
    }
    return true;
}

function readExportCache(projectRoot) {
    const cachePath = path.join(projectRoot, CACHE_FILE_REL);
    try {
        if (!fs.existsSync(cachePath)) return { version: 1, routes: {} };
        const json = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        if (!json || typeof json !== 'object') return { version: 1, routes: {} };
        if (!json.routes || typeof json.routes !== 'object') return { version: 1, routes: {} };
        return json;
    } catch (_) {
        return { version: 1, routes: {} };
    }
}

function writeExportCache(projectRoot, cache) {
    const cachePath = path.join(projectRoot, CACHE_FILE_REL);
    const dir = path.dirname(cachePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(cache || { version: 1, routes: {} }, null, 2), 'utf8');
}

/**
 * Map URL path to file on disk under `out/` (directory-style URLs).
 * @param {string} outDir
 * @param {string} routePath e.g. `/` or `/learn`
 */
function routeToOutHtmlPath(outDir, routePath) {
    const clean = routePath === '/' ? '' : routePath.replace(/^\//, '');
    if (!clean) return path.join(outDir, 'index.html');
    const segments = clean.split('/').filter(Boolean);
    return path.join(outDir, ...segments, 'index.html');
}

function copyDirIfExists(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
        const from = path.join(src, name);
        const to = path.join(dest, name);
        const st = fs.statSync(from);
        if (st.isDirectory()) {
            copyDirIfExists(from, to);
        } else {
            fs.copyFileSync(from, to);
        }
    }
}

/**
 * Export every static `pangaIpepa` page to HTML plus public assets, optional sitemap/RSS and `bemba-site.js`.
 * @param {object} [options]
 * @param {string} [options.projectRoot]
 * @param {string} [options.outDir='out']
 * @param {string} [options.baseUrl] - If set, writes `sitemap.xml` and `feed.xml`
 * @param {string} [options.htmlLang]
 * @param {string} [options.locale] - alias for htmlLang
 * @param {string} [options.siteTitle]
 * @param {boolean} [options.bembaSiteScript=true] - compile flag + copy `/bemba-site.js`
 */
async function exportStaticHtmlSite(options = {}) {
    const projectRoot = path.resolve(options.projectRoot || process.cwd());
    const outDir = path.resolve(projectRoot, options.outDir || 'out');
    const baseUrl = String(options.baseUrl || process.env.BEMBA_SITE_URL || '').replace(/\/$/, '');
    const htmlLang = options.htmlLang || options.locale || 'en';
    const bembaSiteScript = options.bembaSiteScript !== false;

    const cache = readExportCache(projectRoot);
    const newCache = { version: 1, routes: {} };

    // Keep output directory, but ensure it exists. We now do incremental writes.
    fs.mkdirSync(outDir, { recursive: true });

    const router = new BembaRouter(projectRoot);
    const parser = new BembaParser();
    parser.projectRoot = projectRoot;

    const staticPaths = [];
    const rssItems = [];
    const bench = {
        startedAt: Date.now(),
        compiled: 0,
        skipped: 0,
        totalCompileMs: 0
    };

    for (const route of router.getAllRoutes()) {
        if (route.isDynamic) continue;
        let code;
        try {
            code = fs.readFileSync(route.filePath, 'utf8');
        } catch (_) {
            continue;
        }
        if (!code.includes('pangaIpepa')) continue;

        const dest = routeToOutHtmlPath(outDir, route.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });

        // Dependency-aware incremental export
        let deps = [];
        try {
            if (typeof parser.listStaticPageDependencyPaths === 'function') {
                deps = parser.listStaticPageDependencyPaths(code, {
                    projectRoot,
                    pageFilePath: route.filePath
                });
            }
        } catch (_) {
            deps = [];
        }
        if (!deps.length) deps = [path.resolve(route.filePath)];

        const prev = cache.routes && cache.routes[route.path];
        if (
            prev &&
            prev.outFile === dest &&
            Array.isArray(prev.deps) &&
            prev.mtimes &&
            fs.existsSync(dest) &&
            depsStillFresh(prev.deps, prev.mtimes)
        ) {
            bench.skipped += 1;
            newCache.routes[route.path] = prev;
            staticPaths.push(route.path);
            continue;
        }

        let html;
        const t0 = Date.now();
        try {
            html = parser.compile(code, {
                projectRoot,
                currentPath: route.path,
                pageFilePath: route.filePath,
                htmlLang,
                bembaSiteScript
            });
        } catch (err) {
            console.warn(`Skipping ${route.path}: ${err.message}`);
            continue;
        }
        const dt = Date.now() - t0;
        bench.totalCompileMs += dt;
        bench.compiled += 1;

        if (typeof html !== 'string' || !/^\s*</.test(html)) continue;

        fs.writeFileSync(dest, html, 'utf8');
        staticPaths.push(route.path);
        newCache.routes[route.path] = {
            outFile: dest,
            deps,
            mtimes: snapshotDepMtimes(deps)
        };

        const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
        let mtime = new Date();
        try {
            mtime = fs.statSync(route.filePath).mtime;
        } catch (_) {
            /* keep default */
        }
        rssItems.push({
            path: route.path,
            title: titleMatch ? titleMatch[1].trim() : route.path,
            pubDate: mtime
        });
    }

    const pubAmashinda = path.join(projectRoot, BEMBA_FOLDERS.PUBLIC);
    const pubMaungu = path.join(projectRoot, 'maungu');
    copyDirIfExists(pubAmashinda, path.join(outDir, BEMBA_FOLDERS.PUBLIC));
    copyDirIfExists(pubMaungu, path.join(outDir, 'maungu'));

    if (bembaSiteScript && fs.existsSync(BEMBA_SITE_JS)) {
        fs.copyFileSync(BEMBA_SITE_JS, path.join(outDir, 'bemba-site.js'));
    }

    if (baseUrl && staticPaths.length > 0) {
        fs.writeFileSync(
            path.join(outDir, 'sitemap.xml'),
            generateSitemapXml({ baseUrl, paths: staticPaths })
        );
        fs.writeFileSync(
            path.join(outDir, 'feed.xml'),
            generateRssFeedXml({
                baseUrl,
                siteTitle: options.siteTitle || 'BembaJS site',
                items: rssItems
            })
        );
    }

    const rel = path.relative(projectRoot, outDir) || '.';
    writeExportCache(projectRoot, newCache);
    const elapsed = Date.now() - bench.startedAt;
    const avg = bench.compiled ? (bench.totalCompileMs / bench.compiled).toFixed(1) : '0.0';
    console.log(
        `Exported ${staticPaths.length} static page(s) to ${rel} (compiled: ${bench.compiled}, skipped: ${bench.skipped}, avg compile: ${avg}ms, total: ${elapsed}ms)`
    );
    return { outDir, pages: staticPaths.length };
}

module.exports = {
    exportStaticHtmlSite,
    routeToOutHtmlPath
};
