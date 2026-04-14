// Development server with HMR and SSR preview for BembaJS
const express = require('express');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const { BEMBA_FOLDERS } = require('./constants');
const BembaParser = require('./parser');
const BembaTransformer = require('./transformer');
const BembaGenerator = require('./generator');
const BembaRouter = require('./router');
const { loadApiHandlerFromGeneratedSource } = require('./server-load-api');
const { loadBembaFrameworkConfig } = require('./framework-config');
const { renderBembaPageToHtmlString, renderBembaAppRouteToHtmlString } = require('./server-load-react-page');

/** @param {string[]} depPaths @returns {Record<string, number>} */
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
function staticDepsStillFresh(depPaths, mtimes) {
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

class BembaDevServer {
    constructor(options = {}) {
        this.app = express();
        this.port = options.port || 3000;
        this.host = options.host || 'localhost';
        this.projectRoot = process.cwd();
        
        // Compilation cache
        this.compilationCache = new Map();
        this.fileWatchers = new Map();
        /** pangaIpepa HTML cache; entries invalidated when dependency mtimes change */
        this._staticHtmlCache = new Map();
        
        // Framework instances
        this.parser = new BembaParser();
        this.transformer = new BembaTransformer();
        this.generator = new BembaGenerator();
        this.router = new BembaRouter(this.projectRoot);
        
        // Hot reload clients
        this.hotReloadClients = new Set();
        
        this.frameworkConfig = loadBembaFrameworkConfig(this.projectRoot);

        this.setupMiddleware();
        this.setupRoutes();
        this.setupFileWatching();
    }
    
    setupMiddleware() {
        // Body parsing
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Static files
        this.app.use('/amashinda', express.static(path.join(this.projectRoot, BEMBA_FOLDERS.PUBLIC)));
        
        // Hot reload endpoint
        this.app.get('/__bemba_hmr', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });
            
            this.hotReloadClients.add(res);
            
            req.on('close', () => {
                this.hotReloadClients.delete(res);
            });
        });
        
        // Error handling
        this.app.use((error, req, res, next) => {
            console.error('Server error:', error);
            res.status(500).json({ error: error.message });
        });
    }
    
    setupRoutes() {
        // API routes
        this.app.use('/api', this.handleApiRoutes.bind(this));
        
        // Page routes
        this.app.get('*', this.handlePageRoutes.bind(this));
    }
    
    setupFileWatching() {
        const watchPaths = [
            path.join(this.projectRoot, BEMBA_FOLDERS.PAGES),
            path.join(this.projectRoot, BEMBA_FOLDERS.COMPONENTS),
            path.join(this.projectRoot, BEMBA_FOLDERS.API),
            path.join(this.projectRoot, BEMBA_FOLDERS.STYLES)
        ];
        
        for (const watchPath of watchPaths) {
            if (fs.existsSync(watchPath)) {
                const watcher = chokidar.watch(watchPath, {
                    ignored: /(^|[\/\\])\../, // ignore dotfiles
                    persistent: true,
                    ignoreInitial: true
                });
                
                watcher.on('change', (filePath) => this.handleFileChange(filePath));
                watcher.on('add', (filePath) => this.handleFileChange(filePath));
                watcher.on('unlink', (filePath) => this.handleFileChange(filePath));
                
                this.fileWatchers.set(watchPath, watcher);
            }
        }
    }
    
    handleFileChange(filePath) {
        console.log(`File changed: ${filePath}`);
        
        // Clear compilation cache for this file
        const relativePath = path.relative(this.projectRoot, filePath);
        this.compilationCache.delete(relativePath);
        this.compilationCache.delete(`api:${relativePath}`);
        
        // Reload router if it's a route file
        if (filePath.includes(BEMBA_FOLDERS.PAGES) || filePath.includes(BEMBA_FOLDERS.API)) {
            this.router.reloadRoutes();
        }
        
        // Notify hot reload clients
        this.notifyHotReload(relativePath);
    }
    
    hotReloadClientScript() {
        return `
    <script>
        const eventSource = new EventSource('/__bemba_hmr');
        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'reload') {
                window.location.reload();
            }
        };
    </script>`;
    }

    /** Title from `umutwe:` or first string in `pangaIpepa('…')`, else route path. */
    extractPageTitleFromSource(rawSource, route) {
        const m = rawSource.match(/umutwe:\s*["']([^"']*)["']/);
        if (m) return m[1].trim();
        const m2 = rawSource.match(/pangaIpepa\s*\(\s*["']([^"']+)["']/);
        if (m2) return m2[1].trim();
        return (route && route.path) || 'BembaJS';
    }

    wrapDevSsrDocument(innerHtml, title) {
        const safeTitle = this.escapeHtml(title || 'BembaJS');
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle}</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; }
        #root { min-height: 100vh; }
    </style>
</head>
<body>
    <div id="root">${innerHtml}</div>
    ${this.hotReloadClientScript()}
</body>
</html>`;
    }

    notifyHotReload(changedFile) {
        const message = `data: ${JSON.stringify({ type: 'reload', file: changedFile })}\n\n`;
        
        for (const client of this.hotReloadClients) {
            try {
                client.write(message);
            } catch (error) {
                this.hotReloadClients.delete(client);
            }
        }
    }
    
    async handleApiRoutes(req, res, next) {
        try {
            const route = this.router.matchApiRoute(req.path, req.method);
            
            if (!route) {
                return res.status(404).json({ error: 'API route not found' });
            }
            
            // Execute middleware
            const middlewareResult = await this.router.executeMiddleware(req, res, route);
            if (middlewareResult === false) {
                return; // Middleware blocked the request
            }
            
            const handler = await this.compileApiHandler(route.filePath);
            await handler(req, res);
        } catch (error) {
            console.error('API route error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async handlePageRoutes(req, res, next) {
        try {
            const route = this.router.matchRoute(req.path);
            
            if (!route) {
                return res.status(404).send(this.generate404Page());
            }
            
            // Execute middleware
            const middlewareResult = await this.router.executeMiddleware(req, res, route);
            if (middlewareResult === false) {
                return; // Middleware blocked the request
            }
            
            const rawSource = fs.readFileSync(route.filePath, 'utf8');
            if (rawSource.includes('pangaIpepa')) {
                this.parser.projectRoot = this.projectRoot;

                let tryReactSsr =
                    this.frameworkConfig.reactSsrDev !== false && /\bukwisulula\s*:/.test(rawSource);
                if (tryReactSsr) {
                    try {
                        require.resolve('react/package.json', { paths: [this.projectRoot] });
                        require.resolve('react-dom/package.json', { paths: [this.projectRoot] });
                    } catch (_) {
                        tryReactSsr = false;
                        console.warn(
                            'BembaJS: install react and react-dom to enable dev SSR for pages with ukwisulula.'
                        );
                    }
                }

                if (tryReactSsr) {
                    try {
                        const generated = await this.compileFile(route.filePath);
                        let inner;
                        if (route.appRouter && Array.isArray(route.layouts) && route.layouts.length > 0) {
                            const compiledLayouts = [];
                            for (const lp of route.layouts) {
                                compiledLayouts.push(await this.compileFile(lp));
                            }
                            inner = renderBembaAppRouteToHtmlString(generated, compiledLayouts, {
                                filePath: route.filePath
                            });
                        } else {
                            inner = renderBembaPageToHtmlString(generated, { filePath: route.filePath });
                        }
                        const title = this.extractPageTitleFromSource(rawSource, route);
                        res.type('html');
                        return res.send(this.wrapDevSsrDocument(inner, title));
                    } catch (ssrErr) {
                        console.warn(
                            `BembaJS dev SSR skipped for ${route.filePath} (${ssrErr.message}). Trying static HTML…`
                        );
                    }
                }

                try {
                    const cur = req.path || '/';
                    const cacheKey = `${route.filePath}\0${cur}`;
                    let doc;
                    const hit = this._staticHtmlCache.get(cacheKey);
                    const deps = this.parser.listStaticPageDependencyPaths(rawSource, {
                        projectRoot: this.projectRoot,
                        pageFilePath: route.filePath
                    });
                    if (hit && staticDepsStillFresh(hit.deps, hit.mtimes)) {
                        doc = hit.html;
                    } else {
                        doc = this.parser.compile(rawSource, {
                            projectRoot: this.projectRoot,
                            currentPath: cur,
                            pageFilePath: route.filePath
                        });
                        if (
                            typeof doc === 'string' &&
                            /^\s*<(!DOCTYPE|html)/i.test(doc.trimStart())
                        ) {
                            this._staticHtmlCache.set(cacheKey, {
                                html: doc,
                                deps,
                                mtimes: snapshotDepMtimes(deps)
                            });
                        }
                    }
                    if (
                        typeof doc === 'string' &&
                        /^\s*<(!DOCTYPE|html)/i.test(doc.trimStart())
                    ) {
                        res.type('html');
                        return res.send(doc);
                    }
                } catch (docErr) {
                    console.error(`Document compile failed for ${route.filePath}:`, docErr.message);
                }
            }

            const page = await this.compileFile(route.filePath);
            if (page) {
                const html = await this.renderPage(page, route, req);
                res.type('html');
                return res.send(html);
            }
            return res.status(500).send(this.generateErrorPage('Failed to compile page'));
        } catch (error) {
            console.error('Page route error:', error);
            res.status(500).send(this.generateErrorPage(error.message));
        }
    }
    
    /**
     * Compile mafungulo/*.bemba (pangaApi) to a runnable Express handler (server-side).
     */
    async compileApiHandler(filePath) {
        const relativePath = path.relative(this.projectRoot, filePath);
        const cacheKey = `api:${relativePath}`;
        if (this.compilationCache.has(cacheKey)) {
            return this.compilationCache.get(cacheKey);
        }
        this.parser.projectRoot = this.projectRoot;
        const ast = this.parser.parseFile(filePath);
        const transformed = this.transformer.transform(ast);
        const generated = this.generator.generate(transformed);
        const handler = loadApiHandlerFromGeneratedSource(generated, filePath);
        this.compilationCache.set(cacheKey, handler);
        return handler;
    }

    async compileFile(filePath) {
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // Check cache first
        if (this.compilationCache.has(relativePath)) {
            return this.compilationCache.get(relativePath);
        }
        
        try {
            this.parser.projectRoot = this.projectRoot;
            // Parse the file
            const ast = this.parser.parseFile(filePath);
            
            // Transform to React-compatible AST
            const transformed = this.transformer.transform(ast);
            
            // Generate React code
            const generated = this.generator.generate(transformed);
            
            // Cache the result
            this.compilationCache.set(relativePath, generated);
            
            return generated;
        } catch (error) {
            console.error(`Compilation error for ${filePath}:`, error);
            throw error;
        }
    }
    
    async renderPage(page, route, req) {
        // This is a simplified SSR implementation
        // In a real implementation, you would use React's renderToString
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BembaJS App</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .error { color: red; background: #ffe6e6; padding: 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <div id="root">
        <div class="container">
            <h1>BembaJS Development Server</h1>
            <p>Route: ${route.path}</p>
            <div class="error">
                <h3>Non–pangaIpepa module preview</h3>
                <p><strong>pangaIpepa</strong> with <code>ukwisulula</code> uses React SSR in dev when <code>react</code> / <code>react-dom</code> are installed. Layout-first pages use the static HTML compiler.</p>
                <p>Generated code:</p>
                <pre>${this.escapeHtml(page)}</pre>
            </div>
        </div>
    </div>
    ${this.hotReloadClientScript()}
</body>
</html>`;
        
        return html;
    }
    
    generate404Page() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { color: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">Go back home</a>
    </div>
</body>
</html>`;
    }
    
    generateErrorPage(error) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - BembaJS</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .error { color: #e74c3c; background: #ffe6e6; padding: 15px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Error</h1>
        <div class="error">
            <h3>Something went wrong:</h3>
            <p>${this.escapeHtml(error)}</p>
        </div>
    </div>
</body>
</html>`;
    }
    
    escapeHtml(text) {
        const div = { textContent: text };
        return div.textContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    // Start the development server
    start() {
        this.app.listen(this.port, this.host, () => {
            console.log(`🚀 BembaJS development server running at http://${this.host}:${this.port}`);
            console.log(`📁 Project root: ${this.projectRoot}`);
            console.log(`🔥 Hot reload enabled`);
            console.log(`📝 Watching for changes in:`);
            
            for (const [watchPath] of this.fileWatchers) {
                console.log(`   - ${watchPath}`);
            }
            
            console.log(`\n💡 Tips:`);
            console.log(`   - Create pages in the ${BEMBA_FOLDERS.PAGES}/ directory`);
            console.log(`   - Create components in the ${BEMBA_FOLDERS.COMPONENTS}/ directory`);
            console.log(`   - Create API routes in the ${BEMBA_FOLDERS.API}/ directory`);
            console.log(`   - Static files go in the ${BEMBA_FOLDERS.PUBLIC}/ directory`);
        });
    }
    
    // Stop the development server
    stop() {
        // Close all file watchers
        for (const [path, watcher] of this.fileWatchers) {
            watcher.close();
        }
        
        // Close hot reload clients
        for (const client of this.hotReloadClients) {
            try {
                client.end();
            } catch (error) {
                // Ignore errors when closing clients
            }
        }
        
        console.log('🛑 Development server stopped');
    }
    
    // Get server info
    getInfo() {
        return {
            port: this.port,
            host: this.host,
            projectRoot: this.projectRoot,
            watchingPaths: Array.from(this.fileWatchers.keys()),
            hotReloadClients: this.hotReloadClients.size,
            compilationCache: this.compilationCache.size
        };
    }
}

module.exports = BembaDevServer;
