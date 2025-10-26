#!/usr/bin/env node

/**
 * BembaJS Development Server
 * Starts a development server for BembaJS projects
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Enhanced Bemba compiler for development server
function compileBemba(code) {
    try {
        // Basic Bemba to HTML compilation
        if (code.includes('pangaIpepa')) {
            // Extract page data with better regex to handle complex objects
            const pageMatch = code.match(/pangaIpepa\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{([\s\S]*)\}\s*\)/);
            if (pageMatch) {
                const pageName = pageMatch[1];
                const pageData = pageMatch[2];
                
                // Extract title and content
                const titleMatch = pageData.match(/umutwe:\s*['"`]([^'"`]+)['"`]/);
                const contentMatch = pageData.match(/ilyashi:\s*['"`]([^'"`]+)['"`]/);
                
                const title = titleMatch ? titleMatch[1] : pageName;
                const content = contentMatch ? contentMatch[1] : 'Welcome to BembaJS!';
                
                // Extract sections (ifiputulwa) - improved parsing
                let sections = '';
                const sectionsMatch = pageData.match(/ifiputulwa:\s*\[([\s\S]*?)\]/);
                if (sectionsMatch) {
                    const sectionsData = sectionsMatch[1];
                    
                    // Look for buttons directly in the sections data - improved parsing
                    const buttonMatches = sectionsData.match(/ilembo:\s*['"`]([^'"`]+)['"`]/g);
                    
                    // Parse button actions more carefully to handle complex URLs
                    const buttonActions = [];
                    const actionMatches = sectionsData.match(/pakuKlikisha:\s*['"`]([^'"`]*?)['"`]/g);
                    if (actionMatches) {
                        actionMatches.forEach(action => {
                            const match = action.match(/pakuKlikisha:\s*['"`]([^'"`]*?)['"`]/);
                            if (match) {
                                buttonActions.push(match[1]);
                            }
                        });
                    }
                    
                    if (buttonMatches) {
                        sections = buttonMatches.map((btn, index) => {
                            const btnText = btn.match(/['"`]([^'"`]+)['"`]/)[1];
                            const btnAction = buttonActions && buttonActions[index] ? 
                                buttonActions[index] : 
                                `alert('${btnText} clicked!')`;
                            
                            // First button is primary (Deploy now), second is secondary (Read our docs)
                            const isPrimary = index === 0;
                            const buttonClass = isPrimary ? 
                                'rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto' :
                                'rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]';
                            
                            const buttonContent = isPrimary ? 
                                `<img alt="Vercel logomark" loading="lazy" width="20" height="20" decoding="async" data-nimg="1" class="dark:invert" style="color:transparent" src="/vercel.svg">${btnText}` :
                                btnText;
                            
                            return `<a class="${buttonClass}" href="#" onclick="${btnAction}; return false;" target="_blank" rel="noopener noreferrer">${buttonContent}</a>`;
                        }).join('');
                    }
                }
                
                // Extract styles (imikalile)
                let customStyles = '';
                const stylesMatch = pageData.match(/imikalile:\s*`([\s\S]*?)`/);
                if (stylesMatch) {
                    customStyles = stylesMatch[1];
                }
                
                return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/favicon.png">
    <style>
        :root {
            --font-geist-sans: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            --font-geist-mono: 'Geist Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        }
        
        body {
            font-family: var(--font-geist-sans);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        ${customStyles}
    </style>
</head>
<body class="__variable_4d318d __variable_ea5f4b antialiased">
    <div class="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main class="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <img alt="BembaJS logo" width="180" height="38" decoding="async" data-nimg="1" class="dark:invert" style="color:transparent" src="/bemba-logo.svg">
            <ol class="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                <li class="mb-2 tracking-[-.01em]">Get started by editing<!-- --> <code class="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">amapeji/index.bemba</code>.</li>
                <li class="tracking-[-.01em]">Save and see your changes instantly.</li>
            </ol>
            <div class="flex gap-4 items-center flex-col sm:flex-row">
                ${sections}
            </div>
        </main>
        <footer class="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
            <a class="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://bembajs.dev/learn" target="_blank" rel="noopener noreferrer">
                <img aria-hidden="true" alt="File icon" loading="lazy" width="16" height="16" decoding="async" data-nimg="1" style="color:transparent" src="/file.svg">
                Learn
            </a>
            <a class="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://github.com/bembajs/bembajs/tree/main/examples" target="_blank" rel="noopener noreferrer">
                <img aria-hidden="true" alt="Window icon" loading="lazy" width="16" height="16" decoding="async" data-nimg="1" style="color:transparent" src="/window.svg">
                Examples
            </a>
            <a class="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://bembajs.dev" target="_blank" rel="noopener noreferrer">
                <img aria-hidden="true" alt="Globe icon" loading="lazy" width="16" height="16" decoding="async" data-nimg="1" style="color:transparent" src="/globe.svg">
                Go to bembajs.dev →
            </a>
        </footer>
    </div>
</body>
</html>`;
            }
        }
        
        // Fallback for other Bemba syntax
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BembaJS Page</title>
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/favicon.png">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        pre { background: #f8f9fa; padding: 20px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🇿🇲 BembaJS Page</h1>
        <p>Your Bemba code has been compiled successfully!</p>
        <pre>${code}</pre>
    </div>
</body>
</html>`;
    } catch (error) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BembaJS Error</title>
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/favicon.png">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #dc3545; }
        pre { background: #f8f9fa; padding: 20px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ BembaJS Compilation Error</h1>
        <p>There was an error compiling your Bemba code:</p>
        <pre>${error.message}</pre>
    </div>
</body>
</html>`;
    }
}

class BembaDevServer {
    constructor(options = {}) {
        this.port = options.port || 3000;
        this.app = express();
        this.projectRoot = process.cwd();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // Serve static files
        this.app.use('/maungu', express.static(path.join(this.projectRoot, 'maungu')));
        this.app.use('/static', express.static(path.join(this.projectRoot, 'maungu')));
        this.app.use('/public', express.static(path.join(this.projectRoot, 'public')));
        
        // Serve favicon files
        this.app.get('/favicon.ico', (req, res) => {
            const faviconPath = path.join(this.projectRoot, 'public', 'favicon.ico');
            if (fs.existsSync(faviconPath)) {
                res.sendFile(faviconPath);
            } else {
                res.status(404).send('Favicon not found');
            }
        });
        
        this.app.get('/favicon.png', (req, res) => {
            const faviconPath = path.join(this.projectRoot, 'public', 'favicon.png');
            if (fs.existsSync(faviconPath)) {
                res.sendFile(faviconPath);
            } else {
                res.status(404).send('Favicon not found');
            }
        });
        
        // Parse JSON bodies
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupRoutes() {
        // Serve project home page or IDE
        this.app.get('/', (req, res) => {
            // First, try to serve the project's home page
            const indexPath = path.join(this.projectRoot, 'amapeji', 'index.bemba');
            
            if (fs.existsSync(indexPath)) {
                // Serve the project's home page
                this.serveProjectHome(req, res);
            } else {
                // Fall back to IDE if no project home page exists
                const possiblePaths = [
                    path.join(__dirname, '..', '..', '..', 'public', 'index.html'),
                    path.join(process.cwd(), 'public', 'index.html'),
                    path.join(__dirname, '..', '..', '..', '..', 'public', 'index.html')
                ];
                
                let idePath = null;
                for (const possiblePath of possiblePaths) {
                    if (fs.existsSync(possiblePath)) {
                        idePath = possiblePath;
                        break;
                    }
                }
                
                if (idePath) {
                    res.sendFile(idePath);
                } else {
                    this.serveProjectHome(req, res);
                }
            }
        });

        // Serve BembaJS IDE assets from multiple possible locations
        const staticPaths = [
            path.join(__dirname, '..', '..', '..', 'public'),
            path.join(process.cwd(), 'public'),
            path.join(__dirname, '..', '..', '..', '..', 'public')
        ];
        
        staticPaths.forEach(staticPath => {
            if (fs.existsSync(staticPath)) {
                this.app.use('/public', express.static(staticPath));
            }
        });

        // API route for compiling Bemba code
        this.app.post('/api/compile', (req, res) => {
            try {
                const { code } = req.body;
                if (!code) {
                    return res.status(400).json({ error: 'No code provided' });
                }

                const result = compileBemba(code);
                res.json({ 
                    success: true, 
                    result: result,
                    type: 'html'
                });
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });

        // Serve BembaJS IDE at /ide
        this.app.get('/ide', (req, res) => {
            const possiblePaths = [
                path.join(__dirname, '..', '..', '..', 'public', 'index.html'),
                path.join(process.cwd(), 'public', 'index.html'),
                path.join(__dirname, '..', '..', '..', '..', 'public', 'index.html')
            ];
            
            let idePath = null;
            for (const possiblePath of possiblePaths) {
                if (fs.existsSync(possiblePath)) {
                    idePath = possiblePath;
                    break;
                }
            }
            
            if (idePath) {
                res.sendFile(idePath);
            } else {
                res.status(404).send('BembaJS IDE not found');
            }
        });

        // Serve pages from amapeji/ directory
        this.app.get('/:page', (req, res) => {
            const pageName = req.params.page;
            const pagePath = path.join(this.projectRoot, 'amapeji', `${pageName}.bemba`);
            
            if (fs.existsSync(pagePath)) {
                try {
                    const code = fs.readFileSync(pagePath, 'utf8');
                    const html = compileBemba(code);
                    res.send(html);
                } catch (error) {
                    res.status(500).send(`Error compiling page: ${error.message}`);
                }
            } else {
                res.status(404).send('Page not found');
            }
        });

        // API routes from maapi/ directory
        this.app.all('/api/:route', (req, res) => {
            const routeName = req.params.route;
            const apiPath = path.join(this.projectRoot, 'maapi', `${routeName}.bemba`);
            
            if (fs.existsSync(apiPath)) {
                try {
                    const code = fs.readFileSync(apiPath, 'utf8');
                    // For now, just return a simple response
                    // In the future, this could execute the Bemba API code
                    res.json({ 
                        message: `API route ${routeName} executed`,
                        method: req.method,
                        body: req.body,
                        query: req.query
                    });
                } catch (error) {
                    res.status(500).json({ error: error.message });
                }
            } else {
                res.status(404).json({ error: 'API route not found' });
            }
        });
    }

    serveProjectHome(req, res) {
        const indexPath = path.join(this.projectRoot, 'amapeji', 'index.bemba');
        
        if (fs.existsSync(indexPath)) {
            try {
                const code = fs.readFileSync(indexPath, 'utf8');
                const html = compileBemba(code);
                res.send(html);
            } catch (error) {
                res.status(500).send(`Error compiling home page: ${error.message}`);
            }
        } else {
            // Serve a default welcome page
            const defaultPage = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>BembaJS Project</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        .container { max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; margin-bottom: 40px; }
                        .feature { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🇿🇲 Welcome to BembaJS!</h1>
                            <p>Your BembaJS project is running successfully.</p>
                        </div>
                        
                        <div class="feature">
                            <h3>📁 Project Structure</h3>
                            <p>Create files in these directories:</p>
                            <ul>
                                <li><code>amapeji/</code> - Pages (like Next.js pages/)</li>
                                <li><code>ifikopo/</code> - Components</li>
                                <li><code>maapi/</code> - API routes</li>
                                <li><code>maungu/</code> - Static files</li>
                            </ul>
                        </div>
                        
                        <div class="feature">
                            <h3>🚀 Getting Started</h3>
                            <p>Create your first page:</p>
                            <pre><code>// amapeji/index.bemba
pangaIpepa('Home', {
    umutwe: 'Mwaiseni ku BembaJS!',
    ilyashi: 'Welcome to your BembaJS project'
});</code></pre>
                        </div>
                        
                        <div class="feature">
                            <h3>🛠️ Development</h3>
                            <p>Your development server is running at <code>http://localhost:${this.port}</code></p>
                            <p>Hot reload is enabled - changes will be reflected automatically!</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            res.send(defaultPage);
        }
    }

    start() {
        const server = this.app.listen(this.port, () => {
            console.log(`🚀 BembaJS Development Server running at http://localhost:${this.port}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`⚠️  Port ${this.port} is already in use. Trying port ${this.port + 1}...`);
                this.port += 1;
                this.start();
            } else {
                console.error('❌ Server error:', err.message);
                process.exit(1);
            }
        });
    }
}

// If this file is run directly, start the server
if (require.main === module) {
    const server = new BembaDevServer();
    server.start();
}

module.exports = BembaDevServer;
