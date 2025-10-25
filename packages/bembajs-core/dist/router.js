// File-based routing engine for BembaJS framework
const { BEMBA_FOLDERS } = require('./constants');
const fs = require('fs');
const path = require('path');

class BembaRouter {
    constructor(projectRoot, config = {}) {
        this.projectRoot = projectRoot;
        this.config = {
            pagesDir: BEMBA_FOLDERS.PAGES,
            apiDir: BEMBA_FOLDERS.API,
            trailingSlash: false,
            caseSensitive: false,
            ...config
        };
        
        this.routes = new Map();
        this.apiRoutes = new Map();
        this.dynamicRoutes = new Map();
        this.middleware = [];
        
        this.initialize();
    }
    
    initialize() {
        this.scanRoutes();
        this.buildRouteTree();
    }
    
    // Scan for routes in the project
    scanRoutes() {
        const pagesDir = path.join(this.projectRoot, this.config.pagesDir);
        const apiDir = path.join(this.projectRoot, this.config.apiDir);
        
        if (fs.existsSync(pagesDir)) {
            this.scanDirectory(pagesDir, this.routes, 'page');
        }
        
        if (fs.existsSync(apiDir)) {
            this.scanDirectory(apiDir, this.apiRoutes, 'api');
        }
    }
    
    scanDirectory(dir, routeMap, type) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                this.scanDirectory(fullPath, routeMap, type);
            } else if (item.endsWith('.bemba')) {
                const route = this.createRoute(fullPath, type);
                if (route) {
                    routeMap.set(route.path, route);
                }
            }
        }
    }
    
    createRoute(filePath, type) {
        const relativePath = path.relative(
            path.join(this.projectRoot, type === 'page' ? this.config.pagesDir : this.config.apiDir),
            filePath
        );
        
        const routePath = this.convertFilePathToRoute(relativePath);
        const isDynamic = this.isDynamicRoute(routePath);
        const isApi = type === 'api';
        
        return {
            path: routePath,
            filePath: filePath,
            type: type,
            isDynamic: isDynamic,
            isApi: isApi,
            params: isDynamic ? this.extractParams(routePath) : [],
            middleware: [],
            component: null,
            dataFetching: null
        };
    }
    
    convertFilePathToRoute(filePath) {
        let route = filePath
            .replace(/\\/g, '/') // Normalize path separators
            .replace(/\.bemba$/, '') // Remove .bemba extension
            .replace(/\/index$/, '/') // Convert index to root
            .replace(/\/$/, ''); // Remove trailing slash
        
        // Handle dynamic routes [param] -> :param
        route = route.replace(/\[([^\]]+)\]/g, ':$1');
        
        // Handle catch-all routes [...param] -> :param*
        route = route.replace(/\[\.\.\.([^\]]+)\]/g, ':$1*');
        
        // Ensure route starts with /
        if (!route.startsWith('/')) {
            route = '/' + route;
        }
        
        // Handle root route
        if (route === '') {
            route = '/';
        }
        
        return route;
    }
    
    isDynamicRoute(route) {
        return route.includes(':');
    }
    
    extractParams(route) {
        const params = [];
        const matches = route.match(/:([^/]+)/g);
        
        if (matches) {
            for (const match of matches) {
                const param = match.substring(1); // Remove :
                if (param.endsWith('*')) {
                    params.push({
                        name: param.slice(0, -1),
                        isCatchAll: true
                    });
                } else {
                    params.push({
                        name: param,
                        isCatchAll: false
                    });
                }
            }
        }
        
        return params;
    }
    
    // Build route tree for efficient matching
    buildRouteTree() {
        this.routeTree = {
            static: new Map(),
            dynamic: new Map(),
            catchAll: new Map()
        };
        
        for (const [routePath, route] of this.routes) {
            if (route.isDynamic) {
                if (route.params.some(param => param.isCatchAll)) {
                    this.routeTree.catchAll.set(routePath, route);
                } else {
                    this.routeTree.dynamic.set(routePath, route);
                }
            } else {
                this.routeTree.static.set(routePath, route);
            }
        }
    }
    
    // Route matching
    matchRoute(requestPath) {
        // Normalize request path
        const normalizedPath = this.normalizePath(requestPath);
        
        // Try static routes first
        if (this.routeTree.static.has(normalizedPath)) {
            return this.routeTree.static.get(normalizedPath);
        }
        
        // Try dynamic routes
        for (const [routePath, route] of this.routeTree.dynamic) {
            const match = this.matchDynamicRoute(normalizedPath, routePath, route);
            if (match) {
                return match;
            }
        }
        
        // Try catch-all routes
        for (const [routePath, route] of this.routeTree.catchAll) {
            const match = this.matchCatchAllRoute(normalizedPath, routePath, route);
            if (match) {
                return match;
            }
        }
        
        return null;
    }
    
    matchDynamicRoute(requestPath, routePath, route) {
        const routeSegments = routePath.split('/');
        const requestSegments = requestPath.split('/');
        
        if (routeSegments.length !== requestSegments.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i];
            const requestSegment = requestSegments[i];
            
            if (routeSegment.startsWith(':')) {
                const paramName = routeSegment.substring(1);
                params[paramName] = requestSegment;
            } else if (routeSegment !== requestSegment) {
                return null;
            }
        }
        
        return {
            ...route,
            params: params
        };
    }
    
    matchCatchAllRoute(requestPath, routePath, route) {
        const routeSegments = routePath.split('/');
        const requestSegments = requestPath.split('/');
        
        const params = {};
        let routeIndex = 0;
        let requestIndex = 0;
        
        while (routeIndex < routeSegments.length && requestIndex < requestSegments.length) {
            const routeSegment = routeSegments[routeIndex];
            const requestSegment = requestSegments[requestIndex];
            
            if (routeSegment.startsWith(':')) {
                const paramName = routeSegment.substring(1);
                
                if (paramName.endsWith('*')) {
                    // Catch-all parameter
                    const catchAllName = paramName.slice(0, -1);
                    const remainingSegments = requestSegments.slice(requestIndex);
                    params[catchAllName] = remainingSegments.join('/');
                    return {
                        ...route,
                        params: params
                    };
                } else {
                    // Regular parameter
                    params[paramName] = requestSegment;
                    requestIndex++;
                }
            } else if (routeSegment === requestSegment) {
                requestIndex++;
            } else {
                return null;
            }
            
            routeIndex++;
        }
        
        return routeIndex === routeSegments.length && requestIndex === requestSegments.length ? {
            ...route,
            params: params
        } : null;
    }
    
    normalizePath(path) {
        let normalized = path;
        
        // Remove trailing slash if configured
        if (!this.config.trailingSlash && normalized.endsWith('/') && normalized !== '/') {
            normalized = normalized.slice(0, -1);
        }
        
        // Add trailing slash if configured
        if (this.config.trailingSlash && !normalized.endsWith('/')) {
            normalized = normalized + '/';
        }
        
        // Case insensitive matching
        if (!this.config.caseSensitive) {
            normalized = normalized.toLowerCase();
        }
        
        return normalized;
    }
    
    // API route handling
    matchApiRoute(requestPath, method = 'GET') {
        const normalizedPath = this.normalizePath(requestPath);
        
        for (const [routePath, route] of this.apiRoutes) {
            if (route.isDynamic) {
                const match = this.matchDynamicRoute(normalizedPath, routePath, route);
                if (match) {
                    return match;
                }
            } else if (routePath === normalizedPath) {
                return route;
            }
        }
        
        return null;
    }
    
    // Middleware support
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }
    
    async executeMiddleware(request, response, route) {
        for (const middleware of this.middleware) {
            const result = await middleware(request, response, route);
            if (result === false) {
                return false; // Middleware blocked the request
            }
        }
        return true;
    }
    
    // Route generation utilities
    generateRoute(routeName, params = {}) {
        const route = this.routes.get(routeName);
        if (!route) {
            throw new Error(`Route ${routeName} not found`);
        }
        
        let generatedPath = route.path;
        
        // Replace parameters
        for (const [key, value] of Object.entries(params)) {
            generatedPath = generatedPath.replace(`:${key}`, value);
        }
        
        return generatedPath;
    }
    
    // Get all routes
    getAllRoutes() {
        return Array.from(this.routes.values());
    }
    
    getApiRoutes() {
        return Array.from(this.apiRoutes.values());
    }
    
    getDynamicRoutes() {
        return Array.from(this.routes.values()).filter(route => route.isDynamic);
    }
    
    // Route validation
    validateRoutes() {
        const errors = [];
        
        for (const [path, route] of this.routes) {
            // Check for duplicate routes
            const duplicates = Array.from(this.routes.entries())
                .filter(([p, r]) => p === path && r !== route);
            
            if (duplicates.length > 0) {
                errors.push(`Duplicate route: ${path}`);
            }
            
            // Check for invalid dynamic routes
            if (route.isDynamic) {
                const hasCatchAll = route.params.some(param => param.isCatchAll);
                const catchAllIndex = route.params.findIndex(param => param.isCatchAll);
                
                if (hasCatchAll && catchAllIndex !== route.params.length - 1) {
                    errors.push(`Catch-all parameter must be last in route: ${path}`);
                }
            }
        }
        
        return errors;
    }
    
    // Generate route manifest for build
    generateRouteManifest() {
        const manifest = {
            routes: {},
            apiRoutes: {},
            dynamicRoutes: [],
            middleware: this.middleware.length
        };
        
        for (const [path, route] of this.routes) {
            manifest.routes[path] = {
                filePath: route.filePath,
                isDynamic: route.isDynamic,
                params: route.params
            };
        }
        
        for (const [path, route] of this.apiRoutes) {
            manifest.apiRoutes[path] = {
                filePath: route.filePath,
                isDynamic: route.isDynamic,
                params: route.params
            };
        }
        
        manifest.dynamicRoutes = this.getDynamicRoutes().map(route => ({
            path: route.path,
            params: route.params
        }));
        
        return manifest;
    }
    
    // Hot reload support
    reloadRoutes() {
        this.routes.clear();
        this.apiRoutes.clear();
        this.dynamicRoutes.clear();
        this.scanRoutes();
        this.buildRouteTree();
    }
    
    // Watch for file changes
    watchRoutes(callback) {
        const pagesDir = path.join(this.projectRoot, this.config.pagesDir);
        const apiDir = path.join(this.projectRoot, this.config.apiDir);
        
        const watchDirs = [];
        if (fs.existsSync(pagesDir)) watchDirs.push(pagesDir);
        if (fs.existsSync(apiDir)) watchDirs.push(apiDir);
        
        for (const dir of watchDirs) {
            fs.watch(dir, { recursive: true }, (eventType, filename) => {
                if (filename && filename.endsWith('.bemba')) {
                    this.reloadRoutes();
                    if (callback) {
                        callback(eventType, filename);
                    }
                }
            });
        }
    }
}

module.exports = BembaRouter;
