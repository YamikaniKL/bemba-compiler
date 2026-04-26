#!/usr/bin/env node

// CLI tool for BembaJS framework
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { BEMBA_FOLDERS, DEFAULT_CONFIG } = require('./constants');
const BembaParser = require('./parser');
const BembaTransformer = require('./transformer');
const BembaGenerator = require('./generator');
const BembaRouter = require('./router');
const { version: CORE_VERSION } = require('../package.json');
const { parseLangFromArgvOnly, normalizeLang, t: msg } = require('./cli-i18n');

const __coreArgvLang = parseLangFromArgvOnly(process.argv);
if (__coreArgvLang !== undefined) {
    process.env.BEMBA_CLI_LANG = __coreArgvLang;
}

class BembaCLI {
    constructor() {
        this.program = new Command();
        this.setupCommands();
    }
    
    setupCommands() {
        const argvLang = parseLangFromArgvOnly(process.argv);
        this.program.name('bemba').description(msg('rootDesc')).version(CORE_VERSION);
        if (argvLang !== undefined) {
            this.program.option('-l, --lang <lang>', msg('optLang'), argvLang);
        } else {
            this.program.option('-l, --lang <lang>', msg('optLang'));
        }

        this.program.hook('preAction', (thisCommand) => {
            const root =
                thisCommand && typeof thisCommand.root === 'function'
                    ? thisCommand.root()
                    : this.program;
            const opts = root.opts();
            if (opts && opts.lang != null && String(opts.lang).trim() !== '') {
                process.env.BEMBA_CLI_LANG = normalizeLang(opts.lang);
            }
        });
        
        // Create new project
        this.program
            .command('panga <name>')
            .description(msg('pangaDesc'))
            .option('-t, --template <template>', msg('optTemplate'), 'base')
            .option('--typescript', msg('optTypescript'))
            .action((name, options) => this.createProject(name, options));
        
        // Alternative create command
        this.program
            .command('new <name>')
            .description(msg('newDesc'))
            .option('-t, --template <template>', msg('optTemplate'), 'base')
            .option('--typescript', msg('optTypescript'))
            .action((name, options) => this.createProject(name, options));
        
        // Initialize project in current directory
        this.program
            .command('init')
            .description(msg('initDesc'))
            .option('-t, --template <template>', msg('optTemplate'), 'base')
            .option('--typescript', msg('optTypescript'))
            .action((options) => this.initProject(options));
        
        const templateCmd = this.program.command('template').description(msg('templateDesc'));
        templateCmd
            .command('sync')
            .description(msg('templateSyncDesc'))
            .option('-t, --template <template>', msg('optTemplateSync'))
            .option('--starter', msg('optStarter'))
            .action((options) => this.syncTemplateFromPackage(options));

        // Single-token alias (some runners / older help expect one subcommand)
        this.program
            .command('sync-template')
            .description(msg('syncTemplateDesc'))
            .option('-t, --template <template>', msg('optTemplateSync'))
            .option('--starter', msg('optStarter'))
            .action((options) => this.syncTemplateFromPackage(options));

        // Start development server
        this.program
            .command('tungulula')
            .description(msg('tungululaDesc'))
            .option('-p, --port <port>', msg('optPort'), '3000')
            .option('--host <host>', msg('optHost'), 'localhost')
            .action(async (options) => {
                try {
                    await this.startDevServer(options);
                } catch (e) {
                    console.error(e.message || e);
                    process.exit(1);
                }
            });
        
        // Build for production
        this.program
            .command('akha')
            .description(msg('akhaDesc'))
            .option('-o, --output <dir>', msg('optOutput'), 'dist')
            .option('--base-url <url>', msg('optBaseUrl'))
            .option('--locale <code>', msg('optLocale'), 'en')
            .option('--site-title <title>', msg('optSiteTitle'))
            .option('--analyze', msg('optAnalyze'))
            .option('--legacy-next', msg('optLegacyNext'))
            .option('--no-bemba-site', msg('optNoBembaSite'))
            .action(async (options) => {
                try {
                    await this.buildProject(options);
                } catch (e) {
                    console.error(e.message || e);
                    process.exit(1);
                }
            });
        
        // Export static site
        this.program
            .command('fumya')
            .description(msg('fumyaDesc'))
            .option('-o, --output <dir>', msg('optOutput'), 'out')
            .option('--base-url <url>', msg('optBaseUrl'))
            .option('--locale <code>', msg('optLocale'), 'en')
            .option('--site-title <title>', msg('optSiteTitle'))
            .option('--no-bemba-site', msg('optNoBembaSite'))
            .action(async (options) => {
                try {
                    await this.exportStatic(options);
                } catch (e) {
                    console.error(e.message || e);
                    process.exit(1);
                }
            });

        // Explicit legacy static HTML export command
        this.program
            .command('static-export')
            .description(msg('staticExportDesc'))
            .option('-o, --output <dir>', msg('optOutput'), 'out')
            .option('--base-url <url>', msg('optBaseUrl'))
            .option('--locale <code>', msg('optLocale'), 'en')
            .option('--site-title <title>', msg('optSiteTitle'))
            .option('--no-bemba-site', msg('optNoBembaSite'))
            .action(async (options) => {
                try {
                    await this.exportStatic({ ...options, legacyStatic: true });
                } catch (e) {
                    console.error(e.message || e);
                    process.exit(1);
                }
            });
        
        // Compile single file
        this.program
            .command('panga-icibukisho <file>')
            .description(msg('pangaIcibukishoDesc'))
            .option('-o, --output <file>', msg('optOutputFile'))
            .action((file, options) => this.compileFile(file, options));
        
        // Generate component
        this.program
            .command('panga-icipanda <name>')
            .description(msg('pangaIcipandaDesc'))
            .option('-t, --type <type>', msg('optComponentType'), 'functional')
            .action((name, options) => this.generateComponent(name, options));
        
        // Generate page
        this.program
            .command('panga-ipepa <name>')
            .description(msg('pangaIpepaDesc'))
            .option('-d, --dynamic', msg('optDynamic'))
            .action((name, options) => this.generatePage(name, options));
        
        // Lint code
        this.program
            .command('lemba')
            .description(msg('lembaDesc'))
            .option('--fix', msg('optFix'))
            .action((options) => this.lintCode(options));
        
        // Test
        this.program
            .command('esha')
            .description(msg('eshaDesc'))
            .option('--watch', msg('optWatch'))
            .action((options) => this.runTests(options));
    }
    
    // Create new project
    createProject(name, options) {
        console.log(msg('creatingProject', name));
        
        const projectPath = path.resolve(name);
        
        if (fs.existsSync(projectPath)) {
            console.error(msg('dirExists', name));
            process.exit(1);
        }
        
        // Create project directory
        fs.mkdirSync(projectPath, { recursive: true });
        
        // Create folder structure
        this.createFolderStructure(projectPath);
        
        // Create initial files
        this.createInitialFiles(projectPath, name, options);
        
        // Create package.json
        this.createPackageJson(projectPath, name, options);
        
        // Create configuration
        this.createConfig(projectPath);
        
        console.log(msg('projectCreated', name));
        console.log(msg('templateLine', options.template || 'base'));
        console.log(msg('cdLine', name));
        console.log(msg('startDevLine'));
    }
    
    initProject(options) {
        console.log(msg('initInCwd'));
        
        const projectPath = process.cwd();
        const projectName = path.basename(projectPath);
        
        // Check if directory is empty
        const files = fs.readdirSync(projectPath);
        if (files.length > 0) {
            console.log(msg('dirNotEmptyWarn'));
        }
        
        // Create folder structure
        this.createFolderStructure(projectPath);
        
        // Create initial files
        this.createInitialFiles(projectPath, projectName, options);
        
        // Create package.json
        this.createPackageJson(projectPath, projectName, options);
        
        // Create configuration
        this.createConfig(projectPath);
        
        console.log(msg('initOk'));
        console.log(msg('templateLine', options.template || 'base'));
        console.log(msg('locationLine', projectPath));
        console.log(msg('startDevLine'));
    }
    
    createFolderStructure(projectPath) {
        const folders = [
            BEMBA_FOLDERS.PAGES,
            BEMBA_FOLDERS.COMPONENTS,
            BEMBA_FOLDERS.PUBLIC,
            BEMBA_FOLDERS.API,
            BEMBA_FOLDERS.STYLES,
            BEMBA_FOLDERS.UTILS
        ];
        
        for (const folder of folders) {
            const folderPath = path.join(projectPath, folder);
            fs.mkdirSync(folderPath, { recursive: true });
        }
    }
    
    createInitialFiles(projectPath, name, options) {
        const templates = require('./cli-project-templates');
        const template = String(options?.template || 'base').toLowerCase();
        if (template !== 'base' && template !== 'ui') {
            throw new Error(`Unknown template "${template}". Use --template base or --template ui`);
        }
        templates.writeProjectTemplateFiles(projectPath, name, { template, scope: 'all', includeDocs: false });
    }

    /** Refresh files from the installed package so docs (and optionally starter pages) stay aligned with bembajs-core. */
    syncTemplateFromPackage(options) {
        const templates = require('./cli-project-templates');
        const cwd = process.cwd();
        let projectName = path.basename(cwd);
        try {
            const raw = fs.readFileSync(path.join(cwd, 'package.json'), 'utf8');
            const pj = JSON.parse(raw);
            if (pj && typeof pj.name === 'string' && pj.name.trim()) projectName = pj.name.trim();
        } catch (_) {
            /* use directory name */
        }

        let template = String(options.template || '').toLowerCase();
        if (template !== 'base' && template !== 'ui') {
            const starterPath = path.join(cwd, templates.BEMBA_FOLDERS.COMPONENTS, 'cipanda', 'StarterCard.bemba');
            template = fs.existsSync(starterPath) ? 'ui' : 'base';
        }

        const scope = options.starter ? 'all' : 'docs';
        try {
            templates.writeProjectTemplateFiles(cwd, projectName, { template, scope });
        } catch (e) {
            console.error(e.message || e);
            process.exit(1);
        }

        if (scope === 'docs') {
            console.log(msg('syncDocsOk'));
            console.log(msg('syncDocsTip'));
        } else {
            console.log(msg('syncFull', template));
        }
    }

    
    createPackageJson(projectPath, name, options) {
        // Floor at major.minor.0 so `^` always matches published patch lines (avoids Bun/npm edge cases on ^X.Y.Z when Z is brand-new).
        const coreParts = String(CORE_VERSION).split('.');
        const bembajsRange = `^${coreParts[0] || '1'}.${coreParts[1] || '4'}.0`;
        const packageJson = {
            name: name,
            version: '0.1.0',
            private: true,
            scripts: {
                dev: 'bemba tungulula',
                build: 'bemba akha',
                start: 'node dist/server.mjs',
                export: 'bemba fumya',
                lint: 'bemba lint',
                format: 'bemba format',
                test: 'bemba test'
            },
            dependencies: {
                bembajs: bembajsRange,
                'bembajs-core': bembajsRange,
                'express': '^4.21.2',
                'react': '^18.0.0',
                'react-dom': '^18.0.0'
            },
            devDependencies: {
                vite: '^6.0.0',
                '@vitejs/plugin-react': '^4.3.4'
            }
        };
        
        if (options.typescript) {
            packageJson.devDependencies['typescript'] = '^5.0.0';
            packageJson.devDependencies['@types/react'] = '^18.0.0';
            packageJson.devDependencies['@types/react-dom'] = '^18.0.0';
            packageJson.devDependencies['@types/node'] = '^20.0.0';
        }
        
        fs.writeFileSync(
            path.join(projectPath, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
    }
    
    createConfig(projectPath) {
        const config = {
            ...DEFAULT_CONFIG,
            project: {
                name: path.basename(projectPath),
                version: '0.1.0'
            }
        };
        
        fs.writeFileSync(
            path.join(projectPath, 'bemba.config.js'),
            `module.exports = ${JSON.stringify(config, null, 2)};`
        );
    }
    
    findViteConfigPath(projectRoot) {
        const root = projectRoot || process.cwd();
        for (const f of ['vite.config.mjs', 'vite.config.js', 'vite.config.ts']) {
            const p = path.join(root, f);
            if (fs.existsSync(p)) return p;
        }
        const managed = path.join(root, '.bemba', 'injini-vite.config.mjs');
        if (fs.existsSync(managed)) return managed;
        return null;
    }

    ensureManagedInjiniViteConfig(projectRoot) {
        const root = projectRoot || process.cwd();
        const managedDir = path.join(root, '.bemba');
        if (!fs.existsSync(managedDir)) fs.mkdirSync(managedDir, { recursive: true });
        const cfgPath = path.join(managedDir, 'injini-vite.config.mjs');
        const src = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePluginBemba } from 'bembajs-core/vite-plugin-bemba';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [vitePluginBemba(), react({ include: [/\\.[jt]sx$/, /\\.bsx$/] })],
  css: {
    // Avoid parent-directory postcss config bleed in generated/managed Injini projects.
    postcss: {
      plugins: [tailwindcss(), autoprefixer()]
    }
  },
  resolve: {
    extensions: ['.bemba', '.bsx', '.jsx', '.js', '.tsx', '.ts', '.json']
  },
  server: { port: 3000 },
  build: { outDir: 'dist' }
});
`;
        fs.writeFileSync(cfgPath, src, 'utf8');
        return cfgPath;
    }

    ensureManagedInjiniGlue(projectRoot) {
        const root = projectRoot || process.cwd();
        const publicIndex = path.join(root, 'index.html');
        const hasPublicIndex = fs.existsSync(publicIndex);
        if (hasPublicIndex) {
            return { managedIndex: null };
        }
        const managedDir = path.join(root, '.bemba');
        if (!fs.existsSync(managedDir)) fs.mkdirSync(managedDir, { recursive: true });
        const managedIndex = path.join(managedDir, 'injini-index.html');
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BembaJS</title>
  <link rel="icon" href="https://ik.imagekit.io/1umfxhnju/bemba-logo.svg?updatedAt=1761557358350" />
  <style id="bemba-injini-first-paint">
    /* Fallback until linked CSS finishes (should match starter shell) */
    html { background-color: #09090b; color: #fafafa; }
    body { margin: 0; min-height: 100%; background-color: #09090b; color: #fafafa; }
    #root { margin: 0; padding: 0; min-height: 100%; }
  </style>
  <!-- Blocking stylesheet: loads Tailwind/PostCSS before the module graph so tw-* applies on first React paint -->
  <link rel="stylesheet" href="/imikalile/global.css" />
</head>
<body>
  <div id="root"><!--app-html--></div>
  <script type="module" src="/@id/virtual:bemba-app-entry-client"></script>
</body>
</html>
`;
        fs.writeFileSync(managedIndex, html, 'utf8');
        return { managedIndex };
    }

    async startViteDevServer(options, configFile) {
        const managedCfg = path.join(process.cwd(), '.bemba', 'injini-vite.config.mjs');
        if (path.resolve(String(configFile)) === path.resolve(managedCfg)) {
            this.ensureManagedInjiniViteConfig(process.cwd());
        }
        console.log(msg('viteDevReact'));
        let createServer;
        let createLogger;
        try {
            ({ createServer, createLogger } = await import('vite'));
        } catch (e) {
            throw new Error(
                'Injini dependencies are missing. Run `bun install` in this project (if resolution fails, try `bun install --registry https://registry.npmjs.org/`), then run `bemba tungulula` again.'
            );
        }
        const { createBembaInjiniLogger, formatPhishaDevLog, injiniSsrErrorLabels } = require('./injini-vite-messages');
        const injiniLogger = createBembaInjiniLogger(createLogger('info', { allowClearScreen: true }));
        const glue = this.ensureManagedInjiniGlue(process.cwd());
        const { loadBembaFrameworkConfig } = require('./framework-config');
        const fw = loadBembaFrameworkConfig(process.cwd());
        const port = parseInt(String(options.port || '3000'), 10);
        let server;
        try {
            server = await createServer({
                configFile,
                customLogger: injiniLogger,
                logLevel: 'info',
                appType: glue.managedIndex ? 'custom' : undefined,
                server: {
                    port,
                    host: options.host === 'localhost' ? true : options.host
                }
            });
        } catch (e) {
            const m = String(e && e.message ? e.message : e);
            if (/Cannot find package 'vite'|Cannot find module 'vite'|externalize-deps/i.test(m)) {
                throw new Error(
                    'Injini dependencies are missing. Run `bun install` in this project (if resolution fails, try `bun install --registry https://registry.npmjs.org/`), then run `bemba tungulula` again.'
                );
            }
            throw e;
        }

        const escapeHtml = (s) =>
            String(s == null ? '' : s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');

        const renderViteSsrErrorHtml = (err, urlPath) => {
            const L = injiniSsrErrorLabels();
            const message = err && err.message ? String(err.message) : String(err);
            const stack = err && err.stack ? String(err.stack) : '';
            const plugin = err && err.plugin ? String(err.plugin) : '';
            const id = err && err.id ? String(err.id) : (err && err.loc && err.loc.file ? String(err.loc.file) : '');
            const frame = err && err.frame ? String(err.frame) : '';
            const loc = err && err.loc ? err.loc : null;
            const where =
                id && loc && typeof loc.line === 'number' && typeof loc.column === 'number'
                    ? `${id}:${loc.line}:${loc.column}`
                    : id || '';

            const messageShown = formatPhishaDevLog(message);
            const frameShown = frame ? formatPhishaDevLog(frame) : '';

            return `<!DOCTYPE html>
<html lang="${escapeHtml(L.htmlLang)}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(L.title)}</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; }
    .wrap { max-width: 960px; margin: 0 auto; padding: 24px; }
    .card { border: 1px solid rgba(0,0,0,.12); border-radius: 12px; padding: 18px; }
    @media (prefers-color-scheme: dark) { .card { border-color: rgba(255,255,255,.15); } }
    h1 { font-size: 18px; margin: 0 0 8px; }
    p { margin: 6px 0; opacity: .9; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Cascadia Code", "Courier New", monospace; }
    pre { white-space: pre-wrap; word-break: break-word; background: rgba(0,0,0,.04); padding: 12px; border-radius: 10px; overflow: auto; }
    @media (prefers-color-scheme: dark) { pre { background: rgba(255,255,255,.06); } }
    .meta { font-size: 13px; opacity: .85; }
    .pill { display:inline-block; padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(0,0,0,.12); margin-right: 8px; }
    @media (prefers-color-scheme: dark) { .pill { border-color: rgba(255,255,255,.15); } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>${escapeHtml(L.title)}</h1>
      <p>${escapeHtml(L.lead)}</p>
      <p class="meta">${escapeHtml(L.hint)}</p>
      <p class="meta">${escapeHtml(urlPath || '/')}</p>
      <div style="margin-top:12px">
        ${plugin ? `<span class="pill">${escapeHtml(L.pluginPill)}: ${escapeHtml(plugin)}</span>` : ''}
        ${where ? `<span class="pill">${escapeHtml(L.atPill)}: ${escapeHtml(where)}</span>` : ''}
      </div>
      <h2 style="font-size:14px;margin:16px 0 8px">${escapeHtml(L.errorHeading)}</h2>
      <pre>${escapeHtml(messageShown)}</pre>
      ${frame ? `<h2 style="font-size:14px;margin:16px 0 8px">${escapeHtml(L.codeFrameHeading)}</h2><pre>${escapeHtml(frameShown)}</pre>` : ''}
      ${stack ? `<h2 style="font-size:14px;margin:16px 0 8px">${escapeHtml(L.stackHeading)}</h2><pre>${escapeHtml(stack)}</pre>` : ''}
    </div>
  </div>
</body>
</html>`;
        };

        // HTML handling: SSR (Next-like) when enabled, else just serve index.html for SPA-ish behavior.
        // Important: we keep a single HTTP server (Vite's) to avoid double-listen issues.
        server.middlewares.use(async (req, res, next) => {
            try {
                if (!req || !req.url) return next();
                const urlPath = String(req.url || '/');
                const cleanPath = String(urlPath).split('?')[0] || '/';
                const method = String(req.method || 'GET').toUpperCase();
                if (method !== 'GET' && method !== 'HEAD') return next();
                if (cleanPath.startsWith('/@') || cleanPath.startsWith('/node_modules/') || /\.[a-z0-9]+$/i.test(cleanPath)) {
                    return next();
                }

                const templatePath = glue.managedIndex || path.join(process.cwd(), 'index.html');
                let template = fs.readFileSync(templatePath, 'utf8');
                template = await server.transformIndexHtml(cleanPath, template);

                if (fw.reactSsrDev) {
                    const mod = await server.ssrLoadModule('virtual:bemba-app-entry-server');
                    const out = await (mod && mod.render ? mod.render(urlPath) : { html: '', state: { ssr: true, urlPath: cleanPath } });
                    const appHtml = out && typeof out.html === 'string' ? out.html : '';
                    const state = out && out.state ? out.state : { ssr: true, urlPath: cleanPath };
                    const stateScript = `<script>window.__BEMBA_SSR_STATE__=${JSON.stringify(state).replace(/</g, '\\u003c')};</script>`;
                    const html = template
                        .replace('<!--app-html-->', appHtml)
                        .replace('</head>', `${stateScript}\n</head>`);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/html');
                    res.end(html);
                    return;
                }

                // No SSR: keep placeholder empty.
                const html = template.replace('<!--app-html-->', '');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(html);
            } catch (e) {
                try {
                    if (typeof server?.ssrFixStacktrace === 'function') {
                        server.ssrFixStacktrace(e);
                    }
                } catch (_) {
                    /* ignore */
                }
                const urlPath = (req && (req.originalUrl || req.url)) || '/';
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/html');
                res.end(renderViteSsrErrorHtml(e, urlPath));
            }
        });

        await server.listen();
        const urls = server.resolvedUrls || {};
        const local = Array.from(urls.local || []);
        if (local.length > 0) {
            console.log(msg('phishaLocalUrl', local[0]));
        } else {
            console.log(msg('phishaLocalUrl', `http://localhost:${port}`));
        }
    }

    /** React app mode: enabled in config and vite.config.* exists (unless caller asks for legacy static path). */
    shouldUseViteReactApp(options = {}) {
        const { loadBembaFrameworkConfig } = require('./framework-config');
        const cfg = loadBembaFrameworkConfig(process.cwd());
        let viteConfig = this.findViteConfigPath(process.cwd());
        if (options.legacyStatic) return null;
        if (!viteConfig && cfg.reactApp !== false) {
            viteConfig = this.ensureManagedInjiniViteConfig(process.cwd());
        }
        if (cfg.reactApp !== false && viteConfig) {
            return viteConfig;
        }
        return null;
    }

    // Start development server (Vite React app when vite.config.* exists, else Express)
    async startDevServer(options) {
        const viteConfig = this.shouldUseViteReactApp(options);
        if (viteConfig) {
            await this.startViteDevServer(options, viteConfig);
            return;
        }

        console.log(msg('startingDevPort', options.port));

        const DevServer = require('./dev-server');
        const server = new DevServer({
            port: parseInt(options.port, 10),
            host: options.host
        });

        server.start();
    }
    
    // Build project
    async buildProject(options) {
        if (options.legacyNext) {
            console.log(msg('buildingLegacy'));
        const BuildSystem = require('./build');
        const builder = new BuildSystem({
            outputDir: options.output,
            analyze: options.analyze
        });
            return builder.build();
        }

        const viteConfig = this.shouldUseViteReactApp(options);
        if (viteConfig) {
            console.log(msg('viteBuildReact'));
            const { build, createLogger } = await import('vite');
            const { createBembaInjiniLogger } = require('./injini-vite-messages');
            const injiniBuildLogger = createBembaInjiniLogger(createLogger('info', { allowClearScreen: true }));
            const glue = this.ensureManagedInjiniGlue(process.cwd());
            const outDir = options.output || 'dist';

            // Client build (browser/hydration)
            await build({
                configFile: viteConfig,
                customLogger: injiniBuildLogger,
                logLevel: 'info',
                ...(glue.managedIndex
                    ? { build: { outDir, rollupOptions: { input: glue.managedIndex } } }
                    : { build: { outDir } })
            });

            // Server build (SSR entry)
            await build({
                configFile: viteConfig,
                customLogger: injiniBuildLogger,
                logLevel: 'info',
                build: {
                    ssr: true,
                    outDir: path.join(outDir, 'server'),
                    rollupOptions: {
                        input: 'virtual:bemba-app-entry-server',
                        output: {
                            entryFileNames: 'entry-server.mjs',
                            format: 'esm'
                        }
                    }
                }
            });

            // Write a runnable production server entry into dist/
            const serverEntry = `import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { render } from './server/entry-server.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number(process.env.PORT || 3000);
const app = express();

app.use(express.static(__dirname, { index: false }));

app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl || req.url || '/';
    const templatePath = path.join(__dirname, 'injini-index.html');
    const fallbackTemplatePath = path.join(__dirname, 'index.html');
    const raw = fs.existsSync(templatePath)
      ? fs.readFileSync(templatePath, 'utf8')
      : fs.readFileSync(fallbackTemplatePath, 'utf8');
    const out = await render(url);
    const appHtml = out && typeof out.html === 'string' ? out.html : '';
    const state = out && out.state ? out.state : { ssr: true, urlPath: '/' };
    const stateScript = \`<script>window.__BEMBA_SSR_STATE__=\${JSON.stringify(state).replace(/</g,'\\\\u003c')};</script>\`;
    const html = raw
      .replace('<!--app-html-->', appHtml)
      .replace('</head>', stateScript + '\\n</head>');
    res.status(200).setHeader('Content-Type', 'text/html').end(html);
  } catch (e) {
    res.status(500).setHeader('Content-Type', 'text/plain').end(e && e.stack ? e.stack : String(e));
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(\`BembaJS SSR server listening on http://localhost:\${port}\`);
});
`;
            const serverOutPath = path.join(process.cwd(), outDir, 'server.mjs');
            fs.writeFileSync(serverOutPath, serverEntry, 'utf8');

            console.log(msg('viteBuildDone'));
            return;
        }

        if (options.legacyStatic) {
            console.log(msg('usingLegacyStatic'));
        }
        console.log(msg('exportingHtml'));
        const { exportStaticHtmlSite } = require('./static-html-export');
        await exportStaticHtmlSite({
            projectRoot: process.cwd(),
            outDir: options.output || 'dist',
            baseUrl: options.baseUrl || process.env.BEMBA_SITE_URL || '',
            siteTitle: options.siteTitle,
            htmlLang: options.locale || 'en',
            bembaSiteScript: options.bembaSite !== false
        });
    }
    
    // Export static site
    async exportStatic(options) {
        const viteConfig = this.shouldUseViteReactApp(options);
        if (viteConfig) {
            console.log(msg('viteBuildReact'));
            const { build, createLogger } = await import('vite');
            const { createBembaInjiniLogger } = require('./injini-vite-messages');
            const injiniExportLogger = createBembaInjiniLogger(createLogger('info', { allowClearScreen: true }));
            const glue = this.ensureManagedInjiniGlue(process.cwd());
            await build({
                configFile: viteConfig,
                customLogger: injiniExportLogger,
                logLevel: 'info',
                ...(glue.managedIndex ? { build: { outDir: options.output || 'out', rollupOptions: { input: glue.managedIndex } } } : {}),
                ...(glue.managedIndex ? {} : { build: { outDir: options.output || 'out' } })
            });
            console.log(msg('viteBuildDone'));
            return;
        }
        if (options.legacyStatic) {
            console.log(msg('usingLegacyStatic'));
        }
        console.log(msg('exportingSite'));
        const { exportStaticHtmlSite } = require('./static-html-export');
        await exportStaticHtmlSite({
            projectRoot: process.cwd(),
            outDir: options.output || 'out',
            baseUrl: options.baseUrl || process.env.BEMBA_SITE_URL || '',
            siteTitle: options.siteTitle,
            htmlLang: options.locale || 'en',
            bembaSiteScript: options.bembaSite !== false
        });
    }
    
    // Compile single file
    compileFile(file, options) {
        console.log(msg('compilingFile', file));
        
        const parser = new BembaParser();
        const transformer = new BembaTransformer();
        const generator = new BembaGenerator();
        
        try {
            const ast = parser.parseFile(file);
            const transformed = transformer.transform(ast);
            const generated = generator.generate(transformed);
            
            if (options.output) {
                fs.writeFileSync(options.output, generated);
                console.log(msg('compiledTo', options.output));
            } else {
                console.log(generated);
            }
        } catch (error) {
            console.error(msg('compileErr', error.message));
            process.exit(1);
        }
    }
    
    // Generate component
    generateComponent(name, options) {
        console.log(msg('genComponent', name));
        
        const componentContent = `fyambaIcipanda('${name}', {
    ifyapangwa: {
        // Add props here
    },
    ifyakubika: {
        // Add state here
    },
    ukwisulula: nokuti() {
        bwelela (
            <icipandwa className="${name.toLowerCase()}">
                <umutwe>${name}</umutwe>
                {/* Add component content here */}
            </icipandwa>
        )
    }
});`;
        
        const outputPath = path.join(BEMBA_FOLDERS.COMPONENTS, `${name}.bemba`);
        fs.writeFileSync(outputPath, componentContent);
        
        console.log(msg('componentCreated', outputPath));
    }
    
    // Generate page
    generatePage(name, options) {
        console.log(msg('genPage', name));
        
        const pageContent = `pangaIpepa({
    ukwisulula: nokuti() {
        bwelela (
            <icipandwa className="container">
                <umutwe_ukulu>${name}</umutwe_ukulu>
                {/* Add page content here */}
            </icipandwa>
        )
    }${options.dynamic ? ',\n    ukutolaCifukwa: lombako nokuti() {\n        // Add data fetching logic here\n        bwelela { ifyapangwa: {} }\n    }' : ''}
});`;
        
        const fileName = options.dynamic ? `[${name.toLowerCase()}].bemba` : `${name.toLowerCase()}.bemba`;
        const outputPath = path.join(BEMBA_FOLDERS.PAGES, fileName);
        fs.writeFileSync(outputPath, pageContent);
        
        console.log(msg('pageCreated', outputPath));
    }
    
    // Lint code
    lintCode(options) {
        console.log(msg('linting'));
        const root = process.cwd();
        const eslintBin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'eslint.cmd' : 'eslint');
        if (!fs.existsSync(eslintBin)) {
            console.log('ESLint is not installed in this project. Install it to enable lint checks.');
            return;
        }
        const args = ['.'];
        if (options && options.fix) args.push('--fix');
        const result = spawnSync(eslintBin, args, { stdio: 'inherit' });
        if (result.status !== 0) {
            process.exit(result.status || 1);
        }
        console.log(msg('lintOk'));
    }
    
    // Run tests
    runTests(options) {
        console.log(msg('runningTests'));
        const root = process.cwd();
        const nodeArgs = ['--test'];
        if (options && options.watch) nodeArgs.push('--watch');
        const result = spawnSync(process.execPath, nodeArgs, { stdio: 'inherit', cwd: root });
        if (result.status !== 0) {
            process.exit(result.status || 1);
        }
        console.log(msg('testsOk'));
    }
    
    // Run CLI
    run() {
        this.program.parse();
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new BembaCLI();
    cli.run();
}

module.exports = BembaCLI;
