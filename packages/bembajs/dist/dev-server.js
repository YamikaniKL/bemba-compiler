#!/usr/bin/env node

/**
 * BembaJS Development Server
 * Starts a development server for BembaJS projects
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

let coreCompile = null;
let BembaParserClass = null;
try {
    const core = require('bembajs-core');
    coreCompile = core.compile;
    BembaParserClass = core.BembaParser;
} catch (_) {
    /* bembajs-core may be unavailable in some installs */
}

function isHtmlString(str) {
    if (typeof str !== 'string') return false;
    const t = str.trimStart();
    return t.startsWith('<!DOCTYPE') || t.startsWith('<html');
}

/** Full AST compile returns JS; browser preview needs HTML for simple pangaIpepa pages. */
function compilePangaIpepaHtmlViaParser(code) {
    if (!BembaParserClass || !code.includes('pangaIpepa')) return null;
    try {
        const parser = new BembaParserClass();
        const html = parser.compile(code, {});
        return isHtmlString(html) ? html : null;
    } catch (_) {
        return null;
    }
}

/** Slice inner content of the first `key: [ ... ]` array with proper bracket depth. */
function sliceBracketArray(source, key) {
    const re = new RegExp(`\\b${key}:\\s*\\[`);
    const km = source.match(re);
    if (!km) return null;
    const openBracket = source.indexOf('[', km.index);
    if (openBracket === -1) return null;
    let depth = 0;
    for (let i = openBracket; i < source.length; i++) {
        const c = source[i];
        if (c === '[') depth++;
        else if (c === ']') {
            depth--;
            if (depth === 0) {
                return source.slice(openBracket + 1, i);
            }
        }
    }
    return null;
}

/** Legacy fallback buttons (no Tailwind — plain CSS classes .bemba-l-btn). */
function renderLegacyDevButton(btnText, btnAction, index) {
    const isPrimary = index === 0;
    const buttonClass = isPrimary ? 'bemba-l-btn bemba-l-btn--primary' : 'bemba-l-btn bemba-l-btn--secondary';
    const vercelIcon = '<svg width="20" height="20" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" class="dark:invert"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor"/></svg>';
    const buttonContent = isPrimary ? `${vercelIcon}<span>${btnText}</span>` : `<span>${btnText}</span>`;
    const escHref = (u) => String(u).replace(/"/g, '&quot;');

    let href = null;
    let openNewTab = false;

    const locAssign =
        btnAction.match(/window\.location\.href\s*=\s*["']([^"']+)["']/) ||
        btnAction.match(/window\.location\.href\s*=\s*`([^`]+)`/) ||
        btnAction.match(/window\.location\.assign\s*\(\s*["']([^"']+)["']\s*\)/);

    if (locAssign) {
        href = locAssign[1];
    } else if (btnAction.includes('window.open(')) {
        const urlMatch = btnAction.match(/window\.open\s*\(\s*["']([^"']+)["']/);
        if (urlMatch) {
            href = urlMatch[1];
            openNewTab = /\b_blank\b/.test(btnAction) || /^https?:\/\//i.test(href);
        }
    }

    if (href && !/^javascript:/i.test(href) && !/^data:/i.test(href)) {
        const external = /^https?:\/\//i.test(href);
        const target = external && openNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a class="${buttonClass}" href="${escHref(href)}"${target}>${buttonContent}</a>`;
    }

    const enc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return `<button type="button" class="${buttonClass}" onclick="${enc(btnAction)}">${buttonContent}</button>`;
}

/**
 * Compile .bemba to HTML for the dev server preview.
 * Parser HTML first for pangaIpepa (matches bembajs-core layout); no Tailwind CDN.
 */
function compileBembaToHtml(code) {
    try {
        if (code.includes('pangaIpepa')) {
            const parserHtml = compilePangaIpepaHtmlViaParser(code);
            if (parserHtml) {
                return parserHtml;
            }
        }

        if (typeof coreCompile === 'function') {
            const result = coreCompile(code, { legacyFallback: true });
            if (result && result.success && isHtmlString(result.code)) {
                return result.code;
            }
        }
    } catch (_) {
        /* fall through */
    }

    try {
        // Regex fallback (no external CSS frameworks)
        if (code.includes('pangaIpepa')) {
            // Extract page data with better regex to handle complex objects
            const pageMatch = code.match(/pangaIpepa\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{([\s\S]*)\}\s*\)/);
            if (pageMatch) {
                const pageName = pageMatch[1];
                const pageData = pageMatch[2];
                
                // Extract title and content from page level
                const pageTitleMatch = pageData.match(/umutwe:\s*['"`]([^'"`]+)['"`]/);
                const pageContentMatch = pageData.match(/ilyashi:\s*['"`]([^'"`]+)['"`]/);
                
                const pageTitle = pageTitleMatch ? pageTitleMatch[1] : pageName;
                const pageContent = pageContentMatch ? pageContentMatch[1] : 'Welcome to BembaJS!';
                
                // Extract sections (ifiputulwa) - improved parsing
                let sections = '';
                let sectionSteps = '';
                
                const sectionsData = sliceBracketArray(pageData, 'ifiputulwa');
                if (sectionsData) {
                    
                    // Extract amalembelo (steps) array
                    const stepsMatch = sectionsData.match(/amalembelo:\s*\[([\s\S]*?)\]/);
                    if (stepsMatch) {
                        const stepsData = stepsMatch[1];
                        // Extract individual steps - handle both single and double quotes
                        const stepMatches = stepsData.match(/['"`]([^'"`]+)['"`]/g);
                        if (stepMatches) {
                            sectionSteps = stepMatches.map((step, index) => {
                                const stepText = step.replace(/^['"`]|['"`]$/g, '');
                                const isLast = index === stepMatches.length - 1;
                                const marginClass = isLast ? '' : ' mb-2';
                                return `<li class="tracking-[-0.01em]${marginClass}">${stepText}</li>`;
                            }).join('\n                ');
                        }
                    }
                    
                    // Fallback: if no amalembelo found, use umutwe and ilyashi
                    if (!sectionSteps) {
                        const sectionTitleMatch = sectionsData.match(/umutwe:\s*['"`]([^'"`]+)['"`]/);
                        const sectionContentMatch = sectionsData.match(/ilyashi:\s*['"`]([^'"`]+)['"`]/);
                        
                        if (sectionTitleMatch || sectionContentMatch) {
                            const title = sectionTitleMatch ? sectionTitleMatch[1] : '';
                            const content = sectionContentMatch ? sectionContentMatch[1] : '';
                            sectionSteps = `<li class="tracking-[-0.01em] mb-2">${title}</li><li class="tracking-[-0.01em]">${content}</li>`;
                        }
                    }
                    
                    // Look for buttons directly in the sections data - improved parsing
                    const buttonMatches = sectionsData.match(/ilembo:\s*['"`]([^'"`]+)['"`]/g);
                    
                    // Parse button actions more carefully to handle complex URLs
                    const buttonActions = [];
                    
                    // Find all button action blocks more carefully
                    const buttonBlocks = sectionsData.match(/\{[^}]*pakuKlikisha:[^}]*\}/g);
                    
                    if (buttonBlocks) {
                        buttonBlocks.forEach(block => {
                            // Find the pakuKlikisha line and extract everything after the colon
                            const lines = block.split('\n');
                            for (const line of lines) {
                                if (line.includes('pakuKlikisha:')) {
                                    // Find the start of the quoted string
                                    const colonIndex = line.indexOf(':');
                                    const quoteStart = line.indexOf("'", colonIndex);
                                    if (quoteStart !== -1) {
                                        // Find the end of the quoted string (last single quote)
                                        const quoteEnd = line.lastIndexOf("'");
                                        if (quoteEnd > quoteStart) {
                                            const action = line.substring(quoteStart + 1, quoteEnd);
                                            buttonActions.push(action);
                                            break;
                                        }
                                    }
                                }
                            }
                        });
                    }
                    
                    if (buttonMatches) {
                        sections = buttonMatches.map((btn, index) => {
                            const btnText = btn.match(/['"`]([^'"`]+)['"`]/)[1];
                            const btnAction = buttonActions && buttonActions[index] ?
                                buttonActions[index] :
                                `alert('${btnText} clicked!')`;
                            return renderLegacyDevButton(btnText, btnAction, index);
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
    <title>${pageTitle}</title>
    <meta name="description" content="${pageContent}">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/favicon.png">
    <style>
        :root {
            --background: 0 0% 100%;
            --foreground: 0 0% 9%;
            --font-geist-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            --font-geist-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --background: 0 0% 4%;
                --foreground: 0 0% 93%;
            }
        }

        body {
            background: hsl(var(--background));
            color: hsl(var(--foreground));
            font-family: var(--font-geist-sans);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            margin: 0;
        }

        .bemba-l-shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fafafa;
        }
        @media (prefers-color-scheme: dark) {
            .bemba-l-shell { background: #0a0a0a; }
        }
        .bemba-l-main {
            width: 100%;
            max-width: 48rem;
            min-height: 100vh;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            background: hsl(var(--background));
        }
        @media (min-width: 640px) {
            .bemba-l-main { align-items: flex-start; }
        }
        .bemba-l-logo {
            display: block;
        }
        @media (prefers-color-scheme: dark) {
            .bemba-l-logo { filter: invert(1); }
        }
        .bemba-l-steps-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            text-align: center;
            margin-top: 2rem;
        }
        @media (min-width: 640px) {
            .bemba-l-steps-wrap { align-items: flex-start; text-align: left; }
        }
        .bemba-l-steps {
            margin: 0;
            padding-left: 1.25rem;
            list-style: decimal;
            font-family: var(--font-geist-mono);
            font-size: 0.875rem;
            line-height: 1.6;
        }
        .bemba-l-btn-row {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 2rem;
            font-size: 1rem;
            font-weight: 500;
        }
        @media (min-width: 640px) {
            .bemba-l-btn-row { flex-direction: row; flex-wrap: wrap; }
        }
        .bemba-l-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            min-height: 3rem;
            padding: 0.75rem 1.5rem;
            border-radius: 9999px;
            font: inherit;
            cursor: pointer;
            text-decoration: none;
            border: none;
            white-space: nowrap;
            width: 100%;
        }
        @media (min-width: 640px) {
            .bemba-l-btn { width: auto; min-width: 158px; }
        }
        .bemba-l-btn--primary {
            background: hsl(var(--foreground));
            color: hsl(var(--background));
        }
        .bemba-l-btn--primary:hover {
            opacity: 0.9;
        }
        .bemba-l-btn--secondary {
            background: transparent;
            color: hsl(var(--foreground));
            border: 1px solid rgba(0,0,0,0.12);
        }
        @media (prefers-color-scheme: dark) {
            .bemba-l-btn--secondary { border-color: rgba(255,255,255,0.15); }
        }
        .bemba-l-btn--secondary:hover {
            background: rgba(0,0,0,0.04);
        }
        @media (prefers-color-scheme: dark) {
            .bemba-l-btn--secondary:hover { background: rgba(255,255,255,0.06); }
        }
        
        ${customStyles}
    </style>
</head>
<body>
    <div class="bemba-l-shell">
        <main class="bemba-l-main">
            <img
                class="bemba-l-logo"
                src="https://ik.imagekit.io/1umfxhnju/bemba-logo.svg?updatedAt=1761557358350"
                alt="BembaJS logo"
                width="180"
                height="38"
            />
            <div class="bemba-l-steps-wrap">
                <ol class="bemba-l-steps">
                    ${sectionSteps}
                </ol>
            </div>
            <div class="bemba-l-btn-row">
                ${sections}
            </div>
        </main>
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
        /** @type {Set<import('http').ServerResponse>} */
        this._liveClients = new Set();
        this.setupMiddleware();
        this.setupRoutes();
    }

    /** Push a lightweight event so open dev tabs recompile on save (SSE). */
    notifyLiveClients() {
        const payload = `data: ${Date.now()}\n\n`;
        for (const client of this._liveClients) {
            try {
                client.write(payload);
            } catch (_) {
                this._liveClients.delete(client);
            }
        }
    }

    wrapDevHtml(html) {
        if (typeof html !== 'string' || !html.includes('</body>')) {
            return html;
        }
        const snippet =
            '<script data-bemba-live>(function(){try{var s=new EventSource("/__bemba_live");s.onmessage=function(){location.reload()};}catch(e){}})();</script>';
        return html.replace('</body>', `${snippet}</body>`);
    }

    compileBemba(code) {
        return this.wrapDevHtml(compileBembaToHtml(code));
    }

    sendNoCacheHtml(res, html) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.type('html');
        res.send(html);
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
        // Dev live reload (SSE) — register before /:page so this path is not treated as a page name
        this.app.get('/__bemba_live', (req, res) => {
            res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            if (typeof res.flushHeaders === 'function') {
                res.flushHeaders();
            }
            res.write(': bem\n\n');
            this._liveClients.add(res);
            req.on('close', () => {
                this._liveClients.delete(res);
            });
        });

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

                const result = compileBembaToHtml(code);
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
                    const html = this.compileBemba(code);
                    this.sendNoCacheHtml(res, html);
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
                const html = this.compileBemba(code);
                this.sendNoCacheHtml(res, html);
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
            try {
                const chokidar = require('chokidar');
                const dirs = ['amapeji', 'maapi', 'ifikopo']
                    .map((d) => path.join(this.projectRoot, d))
                    .filter((d) => fs.existsSync(d));
                if (dirs.length > 0) {
                    chokidar
                        .watch(dirs, { ignoreInitial: true })
                        .on('all', (evt, filePath) => {
                            if (typeof filePath === 'string' && filePath.endsWith('.bemba')) {
                                const rel = path.relative(this.projectRoot, filePath);
                                console.log(`♻️  ${rel} changed — reloading open tabs.`);
                                this.notifyLiveClients();
                            }
                        });
                    console.log('👀 Watching .bemba files under amapeji/, maapi/, ifikopo/');
                }
            } catch (_) {
                /* chokidar optional */
            }
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
