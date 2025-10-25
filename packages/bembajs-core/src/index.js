// BembaJS Core - Main exports
const BembaLexer = require('./lexer');
const BembaParser = require('./parser');
const BembaTransformer = require('./transformer');
const BembaGenerator = require('./generator');
const { BEMBA_KEYWORDS, BEMBA_FOLDERS } = require('./constants');

/**
 * Compile Bemba code to JavaScript/HTML
 * @param {string} code - Bemba source code
 * @param {object} options - Compilation options
 * @returns {object} Compiled result
 */
function compile(code, options = {}) {
    const lexer = new BembaLexer();
    const parser = new BembaParser(lexer);
    
    try {
        return parser.compile(code, options);
    } catch (error) {
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

// Export all functionality
module.exports = {
    // Main API
    compile,
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
    
    // Version
    version: '1.0.0'
};

// ESM exports
module.exports.default = module.exports;