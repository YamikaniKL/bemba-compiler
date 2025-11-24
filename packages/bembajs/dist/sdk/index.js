/**
 * BembaJS SDK - Programmatic API
 * Provides a clean API for using BembaJS programmatically
 */

const { compile, parse, transform, generate } = require('@bembajs/core');
const { createDevServer, startServer } = require('../server/dev-server');
const { build, bundle, optimize } = require('../build/builder');
const { createProject, scaffold, copyTemplate } = require('../fs/project');
const { loadConfig, defineConfig } = require('../config/loader');

/**
 * Compile Bemba code to JavaScript/HTML
 * @param {string} code - Bemba source code
 * @param {object} options - Compilation options
 * @returns {object} Compiled result
 */
function compileCode(code, options = {}) {
    return compile(code, options);
}

/**
 * Parse Bemba code to AST
 * @param {string} code - Bemba source code
 * @returns {object} Abstract Syntax Tree
 */
function parseCode(code) {
    return parse(code);
}

/**
 * Transform Bemba AST to React-compatible AST
 * @param {object} ast - Bemba AST
 * @returns {object} React AST
 */
function transformAst(ast) {
    return transform(ast);
}

/**
 * Generate JavaScript code from AST
 * @param {object} ast - React-compatible AST
 * @returns {string} Generated JavaScript code
 */
function generateCode(ast) {
    return generate(ast);
}

/**
 * Create and start a development server
 * @param {object} options - Server options
 * @returns {Promise<object>} Server instance
 */
async function devServer(options = {}) {
    const server = await createDevServer(options);
    await startServer(server, options);
    return server;
}

/**
 * Build project for production
 * @param {object} options - Build options
 * @returns {Promise<object>} Build result
 */
async function buildProject(options = {}) {
    return await build(options);
}

/**
 * Bundle project files
 * @param {object} options - Bundle options
 * @returns {Promise<object>} Bundle result
 */
async function bundleProject(options = {}) {
    return await bundle(options);
}

/**
 * Optimize built project
 * @param {object} options - Optimization options
 * @returns {Promise<object>} Optimization result
 */
async function optimizeProject(options = {}) {
    return await optimize(options);
}

/**
 * Create a new BembaJS project
 * @param {string} name - Project name
 * @param {object} options - Project options
 * @returns {Promise<object>} Project creation result
 */
async function newProject(name, options = {}) {
    return await createProject(name, options);
}

/**
 * Scaffold project structure
 * @param {string} path - Project path
 * @param {object} options - Scaffold options
 * @returns {Promise<object>} Scaffold result
 */
async function scaffoldProject(path, options = {}) {
    return await scaffold(path, options);
}

/**
 * Copy template to destination
 * @param {string} template - Template name
 * @param {string} destination - Destination path
 * @returns {Promise<object>} Copy result
 */
async function copyTemplateFiles(template, destination) {
    return await copyTemplate(template, destination);
}

/**
 * Load BembaJS configuration
 * @param {string} path - Config file path
 * @returns {Promise<object>} Configuration object
 */
async function getConfig(path) {
    return await loadConfig(path);
}

/**
 * Define BembaJS configuration
 * @param {object} config - Configuration object
 * @returns {object} Validated configuration
 */
function setConfig(config) {
    return defineConfig(config);
}

// Export all SDK functions
module.exports = {
    // Compiler API
    compile: compileCode,
    parse: parseCode,
    transform: transformAst,
    generate: generateCode,
    
    // Dev Server API
    createDevServer: devServer,
    startDevServer: devServer,
    
    // Build API
    build: buildProject,
    bundle: bundleProject,
    optimize: optimizeProject,
    
    // File System API
    createProject: newProject,
    scaffold: scaffoldProject,
    copyTemplate: copyTemplateFiles,
    
    // Configuration API
    loadConfig: getConfig,
    defineConfig: setConfig,
    
    // Version
    version: require('../../package.json').version
};

// ESM exports
module.exports.default = module.exports;

