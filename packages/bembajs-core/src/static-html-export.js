const fs = require('fs');
const path = require('path');
const { BEMBA_FOLDERS } = require('./constants');
const BembaRouter = require('./router');
const BembaParser = require('./parser');
const { generateSitemapXml, generateRssFeedXml } = require('./static-site-helpers');

const BEMBA_SITE_JS = path.join(__dirname, 'bemba-site.js');

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

    if (fs.existsSync(outDir)) {
        fs.rmSync(outDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outDir, { recursive: true });

    const router = new BembaRouter(projectRoot);
    const parser = new BembaParser();
    parser.projectRoot = projectRoot;

    const staticPaths = [];
    const rssItems = [];

    for (const route of router.getAllRoutes()) {
        if (route.isDynamic) continue;
        let code;
        try {
            code = fs.readFileSync(route.filePath, 'utf8');
        } catch (_) {
            continue;
        }
        if (!code.includes('pangaIpepa')) continue;

        let html;
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
        if (typeof html !== 'string' || !/^\s*</.test(html)) continue;

        const dest = routeToOutHtmlPath(outDir, route.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, html, 'utf8');
        staticPaths.push(route.path);

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
    console.log(`Exported ${staticPaths.length} static page(s) to ${rel}`);
    return { outDir, pages: staticPaths.length };
}

module.exports = {
    exportStaticHtmlSite,
    routeToOutHtmlPath
};
