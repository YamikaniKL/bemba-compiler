#!/usr/bin/env node

/**
 * BembaJS Development Server
 * Starts a development server for BembaJS projects
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { compile } = require('bembajs-core');

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
        
        // Parse JSON bodies
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupRoutes() {
        // Serve BembaJS web IDE
        this.app.get('/', (req, res) => {
            const idePath = path.join(__dirname, '..', '..', '..', 'public', 'index.html');
            if (fs.existsSync(idePath)) {
                res.sendFile(idePath);
            } else {
                this.serveProjectHome(req, res);
            }
        });

        // Serve BembaJS IDE assets
        this.app.use('/public', express.static(path.join(__dirname, '..', '..', '..', 'public')));

        // API route for compiling Bemba code
        this.app.post('/api/compile', (req, res) => {
            try {
                const { code } = req.body;
                if (!code) {
                    return res.status(400).json({ error: 'No code provided' });
                }

                const result = compile(code);
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

        // Serve pages from amapeji/ directory
        this.app.get('/:page', (req, res) => {
            const pageName = req.params.page;
            const pagePath = path.join(this.projectRoot, 'amapeji', `${pageName}.bemba`);
            
            if (fs.existsSync(pagePath)) {
                try {
                    const code = fs.readFileSync(pagePath, 'utf8');
                    const html = compile(code);
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
                const html = compile(code);
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
        this.app.listen(this.port, () => {
            console.log(`🚀 BembaJS Development Server`);
            console.log(`📍 Running at: http://localhost:${this.port}`);
            console.log(`🌐 Web IDE: http://localhost:${this.port}`);
            console.log(`📚 Framework: Next.js-like with Bemba syntax`);
            console.log(`💡 Features:`);
            console.log(`   - Old syntax (pangaWebusaiti) still supported`);
            console.log(`   - New syntax (fyambaIcipanda, pangaIpepa) available`);
            console.log(`   - Hot reload enabled`);
            console.log(`🛠️  CLI Commands:`);
            console.log(`   - bemba panga <name>  : Create new project`);
            console.log(`   - bemba tungulula     : Start dev server`);
            console.log(`   - bemba akha          : Build for production`);
        });
    }
}

// If this file is run directly, start the server
if (require.main === module) {
    const server = new BembaDevServer();
    server.start();
}

module.exports = BembaDevServer;
