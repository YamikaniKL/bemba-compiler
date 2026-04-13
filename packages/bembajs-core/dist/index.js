// BembaJS Core - Main exports
const BembaLexer = require('./lexer');
const BembaParser = require('./parser');
const BembaTransformer = require('./transformer');
const BembaGenerator = require('./generator');
const { BEMBA_KEYWORDS, BEMBA_FOLDERS, BEMBA_FILES, BEMBA_INGISA } = require('./constants');
const { version: CORE_VERSION } = require('../package.json');
const { exportStaticHtmlSite, routeToOutHtmlPath } = require('./static-html-export');
const { resolveCssImports } = require('./css-imports');
const { publicAssetUrl, buildPictureHtml } = require('./asset-helpers');
const { shouldUseGo, runGoEngine } = require('./go-engine');
const {
    buildHeadMetaTags,
    generateSitemapXml,
    generateRssFeedXml,
    escapeXml: escapeXmlForStatic
} = require('./static-site-helpers');

/**
 * Compile Bemba code to JavaScript/HTML (AST path) or static HTML (legacy fallback).
 * @param {string} code - Bemba source code
 * @param {object} [options]
 * @param {boolean} [options.legacyFallback=true] - When AST compile fails, fall back to `BembaParser#compile` (static HTML)
 * @param {boolean} [options.includeAst]
 * @param {boolean} [options.includeTransformedAst]
 * @param {string} [options.projectRoot] - Static pages: enables shell, `ingisa`, `import`
 * @param {string} [options.currentPath] - Static pages: active nav path
 * @param {string} [options.pageFilePath] - Static pages: absolute path to the `.bemba` file
 * @param {string} [options.layoutCode] - Static pages: optional shell override
 * @param {string} [options.htmlLang] - `<html lang>` (BCP 47)
 * @param {string} [options.headExtra] - Trusted fragment after `<title>` in static HTML
 * @param {boolean} [options.bembaSiteScript] - Append `/bemba-site.js` script tag
 * @param {'js' | 'go'} [options.engine='js'] - Experimental: use Go binary bridge when set to `go`
 * @param {string} [options.goBinary] - Optional explicit path to Go engine binary
 * @returns {{ success: true, code: string, legacy?: boolean } | { success: false, error: string, stack?: string }}
 */
function compile(code, options = {}) {
    if (shouldUseGo(options)) {
        const go = runGoEngine('compile', { code, options }, options);
        if (go.ok && go.value && go.value.success) {
            return go.value;
        }
        // Fallback is intentional for compatibility while Go engine matures.
    }

    const lexer = new BembaLexer();
    const parser = new BembaParser();
    const transformer = new BembaTransformer();
    const generator = new BembaGenerator();
    
    try {
        const tokens = lexer.tokenize(code);
        const ast = parser.parse(tokens);
        const transformed = transformer.transform(ast);
        const generated = generator.generate(transformed);
        
        return {
            success: true,
            code: generated,
            ...(options.includeAst ? { ast } : {}),
            ...(options.includeTransformedAst ? { transformedAst: transformed } : {})
        };
    } catch (error) {
        // Backward compatibility for old syntax and demo templates.
        if (options.legacyFallback !== false) {
            try {
                return {
                    success: true,
                    code: parser.compile(code, options),
                    legacy: true
                };
            } catch (legacyError) {
                return {
                    success: false,
                    error: legacyError.message,
                    stack: legacyError.stack
                };
            }
        }
        
        return {
            success: false,
            error: error.message,
            stack: error.stack
        };
    }
}

/**
 * Parse Bemba code to AST
 * @param {string} code - Bemba source code
 * @returns {object} Abstract Syntax Tree
 */
function parse(code) {
    const lexer = new BembaLexer();
    const tokens = lexer.tokenize(code);
    const parser = new BembaParser(lexer);
    return parser.parse(tokens);
}

/**
 * Transform Bemba AST to React-compatible AST
 * @param {object} ast - Bemba AST
 * @returns {object} React AST
 */
function transform(ast) {
    const transformer = new BembaTransformer();
    return transformer.transform(ast);
}

/**
 * Generate JavaScript code from AST
 * @param {object} ast - React-compatible AST
 * @returns {string} Generated JavaScript code
 */
function generate(ast) {
    const generator = new BembaGenerator();
    return generator.generate(ast);
}

/**
 * Absolute paths to `.bemba` files that influence static HTML for a `pangaIpepa` page (shell, `ingisa`, `import`).
 * @param {string} code - Page source
 * @param {{ projectRoot: string, pageFilePath?: string, transitive?: boolean, engine?: 'js' | 'go', goBinary?: string }} options
 * @returns {string[]}
 */
function listStaticPageDependencyPaths(code, options) {
    if (shouldUseGo(options || {})) {
        const go = runGoEngine('list-static-deps', { code, options: options || {} }, options || {});
        if (go.ok && go.value && Array.isArray(go.value.paths)) {
            return go.value.paths;
        }
    }
    const parser = new BembaParser();
    return parser.listStaticPageDependencyPaths(code, options || {});
}

// Export all functionality
module.exports = {
    // Main API
    compile,
    listStaticPageDependencyPaths,
    resolveCssImports,
    publicAssetUrl,
    buildPictureHtml,
    exportStaticHtmlSite,
    routeToOutHtmlPath,
    buildHeadMetaTags,
    generateSitemapXml,
    generateRssFeedXml,
    escapeXmlForStatic,
    parse,
    transform,
    generate,
    
    // Classes
    BembaLexer,
    BembaParser,
    BembaTransformer,
    BembaGenerator,
    
    // Constants
    BEMBA_KEYWORDS,
    BEMBA_FOLDERS,
    BEMBA_FILES,
    BEMBA_INGISA,
    
    // Version
    version: CORE_VERSION
};

// ESM exports
module.exports.default = module.exports;