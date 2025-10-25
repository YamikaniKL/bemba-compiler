/**
 * BembaJS Configuration Loader
 */

const fs = require('fs');
const path = require('path');

/**
 * Load BembaJS configuration
 */
async function loadConfig(configPath) {
    const resolvedPath = configPath || path.join(process.cwd(), 'bemba.config.js');
    
    if (!fs.existsSync(resolvedPath)) {
        return getDefaultConfig();
    }
    
    try {
        const config = require(resolvedPath);
        return validateConfig(config);
    } catch (error) {
        console.error('Error loading config:', error.message);
        return getDefaultConfig();
    }
}

/**
 * Define and validate BembaJS configuration
 */
function defineConfig(config) {
    return validateConfig(config);
}

/**
 * Get default configuration
 */
function getDefaultConfig() {
    return {
        name: 'bemba-app',
        version: '1.0.0',
        framework: 'nextjs-like',
        folders: {
            pages: 'amapeji',
            components: 'ifikopo',
            styles: 'imikalile',
            assets: 'mafungulo',
            api: 'maapi',
            utils: 'mautils',
            hooks: 'mahooks',
            context: 'macontext'
        },
        compiler: {
            target: 'react',
            output: 'dist',
            sourceMaps: true,
            minify: true,
            optimize: true
        },
        dev: {
            port: 3000,
            hotReload: true,
            openBrowser: true,
            apiPort: 3001
        },
        build: {
            output: 'dist',
            static: 'out',
            ssg: true,
            ssr: true,
            optimize: true
        },
        features: {
            routing: true,
            ssr: true,
            ssg: true,
            apiRoutes: true,
            components: true,
            hooks: true,
            context: true,
            styling: true
        }
    };
}

/**
 * Validate configuration
 */
function validateConfig(config) {
    const defaultConfig = getDefaultConfig();
    
    return {
        ...defaultConfig,
        ...config,
        folders: { ...defaultConfig.folders, ...config.folders },
        compiler: { ...defaultConfig.compiler, ...config.compiler },
        dev: { ...defaultConfig.dev, ...config.dev },
        build: { ...defaultConfig.build, ...config.build },
        features: { ...defaultConfig.features, ...config.features }
    };
}

module.exports = {
    loadConfig,
    defineConfig,
    getDefaultConfig
};

