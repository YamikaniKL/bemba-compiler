/**
 * BembaJS Development Server
 */

const express = require('express');
const path = require('path');
const chokidar = require('chokidar');
const { compile } = require('@bembajs/core');

/**
 * Create development server
 */
async function createDevServer(options = {}) {
    const app = express();
    const port = options.port || 3000;
    
    // Middleware
    app.use(express.json());
    app.use(express.static(path.join(process.cwd(), 'public')));
    
    // Compile endpoint
    app.post('/compile', (req, res) => {
        try {
            const { code } = req.body;
            const result = compile(code);
            res.json({ success: true, result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Hot reload support
    if (options.watch !== false) {
        const watcher = chokidar.watch(['amapeji/**/*.bemba', 'ifikopo/**/*.bemba'], {
            ignored: /node_modules/,
            persistent: true
        });
        
        watcher.on('change', (filepath) => {
            console.log(`📝 File changed: ${filepath}`);
            // Emit reload event to connected clients
        });
        
        app.locals.watcher = watcher;
    }
    
    return { app, port };
}

/**
 * Start development server
 */
async function startServer(server, options = {}) {
    const { app, port } = server;
    
    return new Promise((resolve) => {
        const httpServer = app.listen(port, () => {
            console.log(`🚀 BembaJS Dev Server running at http://localhost:${port}`);
            resolve(httpServer);
        });
    });
}

module.exports = {
    createDevServer,
    startServer
};

