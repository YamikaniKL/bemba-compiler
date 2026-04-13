// Enhanced Parser for BembaJS framework - handles multi-file projects and comprehensive AST
const BembaLexer = require('./lexer');
const { 
    ComponentNode, 
    PageNode, 
    ApiRouteNode, 
    ProgramNode, 
    ModuleNode,
    JSXElementNode,
    JSXTextNode,
    JSXExpressionNode,
    HookNode,
    FunctionCallNode,
    ExpressionNode,
    VariableNode,
    ImportNode,
    ExportNode,
    ASTUtils
} = require('./ast');
const { BEMBA_SYNTAX, BEMBA_FOLDERS, BEMBA_FILES, BEMBA_INGISA } = require('./constants');
const fs = require('fs');
const path = require('path');

/** For onclick="..." — HTML does not treat \\" as an escape; use entities so the handler stays valid. */
function encodeJsForHtmlDoubleQuotedAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function normalizeNavPath(p) {
    if (p == null || p === '') return '/';
    let x = String(p).trim();
    const qi = x.indexOf('?');
    if (qi >= 0) x = x.slice(0, qi);
    const hi = x.indexOf('#');
    if (hi >= 0) x = x.slice(0, hi);
    if (x.length > 1 && x.endsWith('/')) x = x.slice(0, -1);
    return x === '' ? '/' : x;
}

/** True when this nav item should show as the current page (path routes only; not #anchors). */
function navHrefIsActive(href, currentPath) {
    const h = String(href || '').trim();
    if (!h || h.startsWith('#')) return false;
    if (/^https?:\/\//i.test(h)) return false;
    const c = normalizeNavPath(currentPath);
    const hn = normalizeNavPath(h);
    if (hn === '/' || hn === '') return c === '/' || c === '';
    return c === hn;
}

function escapeHtmlNav(s) {
    if (s == null || s === '') return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Parse `{ ilembo, inshila }` pairs from the inner text of a nav links array `[ ... ]`.
 */
function parseNavLinkObjectsFromArrayInner(inner) {
    if (!inner || !String(inner).trim()) return [];
    const links = [];
    const patIlemboFirst =
        /\{\s*ilembo:\s*(["'])([^"']*)\1\s*,\s*inshila:\s*(["'])([^"']*)\3\s*\}/g;
    let m;
    while ((m = patIlemboFirst.exec(inner)) !== null) {
        links.push({ label: m[2], href: m[4] });
    }
    if (links.length > 0) return links;
    const patInshilaFirst =
        /\{\s*inshila:\s*(["'])([^"']*)\1\s*,\s*ilembo:\s*(["'])([^"']*)\3\s*\}/g;
    while ((m = patInshilaFirst.exec(inner)) !== null) {
        links.push({ label: m[4], href: m[2] });
    }
    return links;
}

/**
 * Split the inner text of a `[ ... ]` array into top-level `{ ... }` object literals.
 */
function extractTopLevelBraceObjectsFromArrayInner(inner) {
    const s = String(inner || '').trim();
    const objs = [];
    let i = 0;
    while (i < s.length) {
        while (i < s.length && /[\s,]/.test(s[i])) i++;
        if (i >= s.length) break;
        if (s[i] !== '{') {
            i++;
            continue;
        }
        let depth = 0;
        const start = i;
        for (; i < s.length; i++) {
            const c = s[i];
            if (c === '{') depth++;
            else if (c === '}') {
                depth--;
                if (depth === 0) {
                    i++;
                    objs.push(s.slice(start, i));
                    break;
                }
            }
        }
    }
    return objs;
}

/**
 * Replace tokens in NavBar partial HTML with data from umusango (site name + nav links + active route).
 */
function fillNavShellPlaceholders(template, siteName, navLinks, activePath) {
    const brand = escapeHtmlNav(siteName || 'BembaJS');
    const linksHtml = (navLinks || [])
        .map((l) => {
            const active = navHrefIsActive(l.href, activePath);
            const cls = active ? 'nav-link is-active' : 'nav-link';
            const cur = active ? ' aria-current="page"' : '';
            return `<a href="${escapeHtmlNav(l.href)}" class="${cls}"${cur}>${escapeHtmlNav(l.label)}</a>`;
        })
        .join('');
    return String(template || '')
        .split('{{BEMBA_NAV_BRAND}}')
        .join(brand)
        .split('{{BEMBA_NAV_LINKS}}')
        .join(linksHtml);
}

/**
 * Resolve a relative .bemba import from a page file; must stay inside projectRoot.
 */
function resolveBembaImportPath(projectRoot, pageFilePath, source) {
    if (source == null || typeof source !== 'string') return null;
    const s = source.trim().replace(/\\/g, '/');
    if (!s || /^https?:\/\//i.test(s)) return null;
    const dir = path.dirname(path.resolve(pageFilePath));
    let rel = s;
    if (!/\.bemba$/i.test(rel)) {
        rel += '.bemba';
    }
    const candidate = path.normalize(path.resolve(dir, rel));
    const rootNorm = path.normalize(path.resolve(projectRoot));
    const relToRoot = path.relative(rootNorm, candidate);
    if (relToRoot.startsWith('..') || path.isAbsolute(relToRoot)) {
        return null;
    }
    if (!fs.existsSync(candidate)) return null;
    return candidate;
}

class BembaParser {
    constructor() {
        this.lexer = new BembaLexer();
        this.tokens = [];
        this.current = 0;
        this.errors = [];
        this.modules = new Map();
        this.projectRoot = '';
        
        // Track file dependencies
        this.dependencies = new Map();
        this.imports = new Map();
        this.exports = new Map();
    }
    
    // Main parsing methods
    parse(tokens) {
        this.tokens = tokens;
        this.current = 0;
        this.errors = [];
        return this.parseProgram();
    }
    
    parseProject(projectRoot) {
        this.projectRoot = projectRoot;
        this.modules.clear();
        this.dependencies.clear();
        this.imports.clear();
        this.exports.clear();
        
        try {
            // Parse all Bemba files in the project
            this.parseDirectory(projectRoot);
            
            // Build dependency graph
            this.buildDependencyGraph();
            
            // Validate all modules
            this.validateModules();
            
            return {
                modules: this.modules,
                dependencies: this.dependencies,
                imports: this.imports,
                exports: this.exports,
                errors: this.errors
            };
        } catch (error) {
            this.errors.push(`Project parsing error: ${error.message}`);
            throw error;
        }
    }
    
    parseFile(filePath) {
        try {
            const source = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(this.projectRoot, filePath);
            
            // Tokenize the source
            this.tokens = this.lexer.tokenize(source);
            this.current = 0;
            
            // Parse the program
            const program = this.parseProgram();
            
            // Create module node
            const module = new ModuleNode(relativePath, program);
            module.dependencies = this.extractDependencies(program);
            
            this.modules.set(relativePath, module);
            return module;
        } catch (error) {
            this.errors.push(`Error parsing ${filePath}: ${error.message}`);
            throw error;
        }
    }
    
    parseDirectory(dirPath) {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Recursively parse subdirectories
                this.parseDirectory(fullPath);
            } else if (item.endsWith('.bemba')) {
                // Parse Bemba files
                this.parseFile(fullPath);
            }
        }
    }
    
    // Program parsing
    parseProgram() {
        const statements = [];
        
        while (true) {
            this.skipTrivia();
            if (this.isAtEnd()) break;
            // Skip empty statements and ASI-style terminators
            while (this.match('SEMICOLON')) {
                this.skipTrivia();
            }
            if (this.isAtEnd()) break;

            const statement = this.parseStatement();
            if (statement) {
                statements.push(statement);
            }
            this.skipTrivia();
            while (this.match('SEMICOLON')) {
                this.skipTrivia();
            }
        }
        
        return new ProgramNode(statements);
    }
    
    parseStatement() {
        if (this.check('IF')) {
            return this.parseIfStatement();
        } else if (this.check('FOR')) {
            return this.parseForStatement();
        } else if (this.check('WHILE')) {
            return this.parseWhileStatement();
        } else if (this.check('TRY')) {
            return this.parseTryStatement();
        } else if (this.check('COMPONENT_DEF')) {
            return this.parseComponent();
        } else if (this.check('PAGE_DEF')) {
            return this.parsePage();
        } else if (this.checkKeyword('import')) {
            return this.parseImport();
        } else if (this.checkKeyword('export')) {
            return this.parseExport();
        } else if (this.checkKeyword('let') || this.checkKeyword('const') || this.checkKeyword('var')) {
            return this.parseVariableDeclaration();
        } else if (this.check('ASYNC') || this.check('FUNCTION')) {
            return this.parseFunctionDeclaration();
        } else if (this.check('IDENTIFIER') && this.peek().literal === 'pangaApi') {
            return this.parseApiRoute();
        } else {
            return this.parseExpression();
        }
    }

    parseApiRoute() {
        this.advance(); // pangaApi
        this.consume('LEFT_PAREN', 'Expected ( after pangaApi');

        if (!this.check('STRING') && !this.check('IDENTIFIER')) {
            throw new Error('Expected API route path string');
        }
        const pathTok = this.advance();
        const routePath = pathTok.literal != null ? String(pathTok.literal) : pathTok.lexeme;

        this.consume('COMMA', 'Expected , after API path');
        const config = this.parseObject();
        this.consume('RIGHT_PAREN', 'Expected ) after pangaApi config');
        if (this.match('SEMICOLON')) {
            // optional
        }

        let method = 'GET';
        let handler = null;
        if (config.properties) {
            const m = config.properties.method;
            if (m != null) {
                if (typeof m === 'string') {
                    method = m.replace(/^['"]|['"]$/g, '').toUpperCase() || 'GET';
                } else if (m.type === 'STRING') {
                    method = String(m.literal != null ? m.literal : m.value || 'GET').toUpperCase();
                }
            }
            handler = config.properties.handler != null ? config.properties.handler : null;
        }

        return new ApiRouteNode(routePath, method, handler);
    }
    
    // Component parsing
    parseComponent() {
        this.advance(); // consume 'fyambaIcipanda'
        this.consume('LEFT_PAREN', 'Expected ( after fyambaIcipanda');
        
        // Parse component name
        if (!this.check('STRING') && !this.check('IDENTIFIER')) {
            throw new Error('Expected component name');
        }
        const nameToken = this.advance();
        const name = nameToken.literal || nameToken.value;
        this.consume('COMMA', 'Expected , after component name');
        
        // Parse component configuration
        const config = this.parseObject();
        
        // Parse closing parenthesis
        this.consume('RIGHT_PAREN', 'Expected ) after component config');
        
        // Parse semicolon if present
        if (this.check('SEMICOLON')) {
            this.advance();
        }
        
        const component = new ComponentNode(name);
        
        // Extract component properties
        if (config.properties) {
            for (const [key, value] of Object.entries(config.properties)) {
                switch (key) {
                    case BEMBA_SYNTAX.PROPS:
                        component.props = value;
                        break;
                    case BEMBA_SYNTAX.STATE:
                        component.state = value;
                        break;
                    case BEMBA_SYNTAX.CONSTRUCTOR:
                        component.lifecycle.constructor = value;
                        break;
                    case BEMBA_SYNTAX.RENDER:
                        component.lifecycle.render = value;
                        break;
                    case BEMBA_SYNTAX.DATA_FETCHING:
                        component.lifecycle.dataFetching = value;
                        break;
                    default:
                        component.methods[key] = value;
                        break;
                }
            }
        }
        
        return component;
    }
    
    // Page parsing
    parsePage() {
        this.advance(); // consume 'pangaIpepa'
        
        // Parse opening parenthesis
        this.consume('LEFT_PAREN', 'Expected ( after pangaIpepa');
        let pageName = '';
        
        if (this.check('STRING') || this.check('IDENTIFIER')) {
            const nameToken = this.advance();
            pageName = nameToken.literal || nameToken.value || '';
            this.consume('COMMA', 'Expected , after page name');
        }
        
        // Parse page configuration
        const config = this.parseObject();
        
        // Parse closing parenthesis
        this.consume('RIGHT_PAREN', 'Expected ) after page config');
        
        // Parse semicolon if present
        if (this.check('SEMICOLON')) {
            this.advance();
        }
        
        const page = new PageNode('', null);
        page.metadata = { name: pageName };
        
        // Extract page properties
        if (config.properties) {
            for (const [key, value] of Object.entries(config.properties)) {
                switch (key) {
                    case BEMBA_SYNTAX.RENDER:
                        page.component = value;
                        break;
                    case BEMBA_SYNTAX.DATA_FETCHING:
                        page.dataFetching = value;
                        break;
                    default:
                        page.metadata[key] = value;
                        break;
                }
            }
        }
        
        return page;
    }
    
    // Object parsing
    parseObject() {
        this.consume('LEFT_BRACE', 'Expected {');
        
        const properties = {};
        
        if (!this.check('RIGHT_BRACE')) {
            do {
                let key = null;
                if (this.check('STRING') || this.check('IDENTIFIER') || this.isKeywordToken(this.peek().type)) {
                    key = this.advance();
                } else {
                    key = this.parseExpression();
                }
                this.consume('COLON', 'Expected : after property key');
                const valueStart = this.current;
                let value;
                try {
                    value = this.parseExpression();
                } catch (error) {
                    // Recover for complex syntaxes (JSX/function bodies) we don't fully parse yet.
                    this.current = valueStart;
                    value = this.parseLooseValueUntilBoundary();
                }
                
                if (key && (key.type === 'STRING' || key.type === 'IDENTIFIER' || this.isKeywordToken(key.type))) {
                    properties[key.literal || key.value] = value;
                }
            } while (this.match('COMMA'));
        }
        
        this.consume('RIGHT_BRACE', 'Expected }');
        
        return { properties };
    }
    
    // Expression parsing
    parseExpression() {
        return this.parseAssignment();
    }
    
    parseAssignment() {
        const expr = this.parseOr();
        
        if (this.match('ASSIGN')) {
            const value = this.parseAssignment();
            return new ExpressionNode('ASSIGN', expr, value);
        }
        
        return expr;
    }
    
    parseOr() {
        let expr = this.parseAnd();
        
        while (this.match('OR')) {
            const operator = this.previous();
            const right = this.parseAnd();
            expr = new ExpressionNode(operator.type, expr, right);
        }
        
        return expr;
    }
    
    parseAnd() {
        let expr = this.parseEquality();
        
        while (this.match('AND')) {
            const operator = this.previous();
            const right = this.parseEquality();
            expr = new ExpressionNode(operator.type, expr, right);
        }
        
        return expr;
    }
    
    parseEquality() {
        let expr = this.parseComparison();
        
        while (this.match('EQUALS', 'NOT_EQUALS')) {
            const operator = this.previous();
            const right = this.parseComparison();
            expr = new ExpressionNode(operator.type, expr, right);
        }
        
        return expr;
    }
    
    parseComparison() {
        let expr = this.parseTerm();
        
        while (this.match('GREATER_THAN', 'GREATER_EQUAL', 'LESS_THAN', 'LESS_EQUAL')) {
            const operator = this.previous();
            const right = this.parseTerm();
            expr = new ExpressionNode(operator.type, expr, right);
        }
        
        return expr;
    }
    
    parseTerm() {
        let expr = this.parseFactor();
        
        while (this.match('PLUS', 'MINUS')) {
            const operator = this.previous();
            const right = this.parseFactor();
            expr = new ExpressionNode(operator.type, expr, right);
        }
        
        return expr;
    }
    
    parseFactor() {
        let expr = this.parseUnary();
        
        while (this.match('MULTIPLY', 'DIVIDE', 'MODULO')) {
            const operator = this.previous();
            const right = this.parseUnary();
            expr = new ExpressionNode(operator.type, expr, right);
        }
        
        return expr;
    }
    
    parseUnary() {
        if (this.match('BANG', 'MINUS')) {
            const operator = this.previous();
            const right = this.parseUnary();
            return new ExpressionNode(operator.type, right);
        }
        
        if (this.check('AWAIT')) {
            return this.parseAwaitExpression();
        }
        
        return this.parseCall();
    }
    
    parseCall() {
        let expr = this.parsePrimary();
        
        while (true) {
            if (this.match('LEFT_PAREN')) {
                expr = this.finishCall(expr);
            } else if (this.match('DOT')) {
                const name = this.consume('IDENTIFIER', 'Expected property name after .').literal;
                expr = new ExpressionNode('GET', expr, name);
            } else {
                break;
            }
        }
        
        return expr;
    }
    
    finishCall(callee) {
        const args = [];
        
        if (!this.check('RIGHT_PAREN')) {
            do {
                args.push(this.parseExpression());
            } while (this.match('COMMA'));
        }
        
        this.consume('RIGHT_PAREN', 'Expected ) after arguments');
        
        return new FunctionCallNode(callee, args);
    }
    
    parsePrimary() {
        if (this.match('BOOLEAN')) {
            const value = this.previous().literal;
            return { type: 'BOOLEAN', value: value === 'ee' };
        }
        if (this.match('NUMBER', 'STRING')) return this.previous();
        if (this.match('IDENTIFIER')) return this.previous();
        
        if (this.check('LEFT_BRACE')) {
            return this.parseInlineObject();
        }
        
        if (this.check('LEFT_BRACKET')) {
            return this.parseInlineArray();
        }
        
        if (this.match('LEFT_PAREN')) {
            const expr = this.parseExpression();
            this.consume('RIGHT_PAREN', 'Expected ) after expression');
            return expr;
        }
        
        throw new Error(`Unexpected token: ${this.peek().type}`);
    }
    
    // Hook parsing
    parseHook() {
        const hookType = this.previous().literal;
        this.consume('LEFT_PAREN', 'Expected ( after hook');
        
        const args = [];
        if (!this.check('RIGHT_PAREN')) {
            do {
                args.push(this.parseExpression());
            } while (this.match('COMMA'));
        }
        
        this.consume('RIGHT_PAREN', 'Expected ) after hook arguments');
        
        return new HookNode(hookType, args);
    }
    
    // Import/Export parsing
    parseImport() {
        this.consumeKeyword('import', 'Expected import');
        
        const specifiers = [];
        let source = '';
        
        if (this.check('LEFT_BRACE')) {
            // Named imports
            this.advance();
            do {
                const name = this.consume('IDENTIFIER', 'Expected import name').literal;
                specifiers.push({ name, alias: null });
            } while (this.match('COMMA'));
            this.consume('RIGHT_BRACE', 'Expected } after import specifiers');
        } else {
            // Default import
            const name = this.consume('IDENTIFIER', 'Expected import name').literal;
            specifiers.push({ name, alias: null, isDefault: true });
        }
        
        this.consumeKeyword('from', 'Expected from after import');
        source = this.consume('STRING', 'Expected import source').literal;
        
        return new ImportNode(source, specifiers);
    }
    
    parseExport() {
        this.consumeKeyword('export', 'Expected export');
        
        const isDefault = this.matchKeyword('default');
        const declaration = this.parseStatement();
        
        return new ExportNode(declaration, isDefault);
    }
    
    // Variable declaration parsing
    parseVariableDeclaration() {
        const kindToken = this.advance();
        const kind = kindToken.literal || kindToken.type;
        const name = this.consume('IDENTIFIER', 'Expected variable name').literal;
        
        let initializer = null;
        if (this.match('ASSIGN')) {
            initializer = this.parseExpression();
        }
        
        return new VariableNode(name, initializer, kind === 'const');
    }
    
    // Function declaration parsing
    parseFunctionDeclaration() {
        const isAsync = this.check('ASYNC');
        if (isAsync) {
            this.advance(); // consume async keyword
        }
        
        this.consume('FUNCTION', 'Expected function keyword');
        
        const name = this.consume('IDENTIFIER', 'Expected function name').literal;
        this.consume('LEFT_PAREN', 'Expected ( after function name');
        
        const params = [];
        if (!this.check('RIGHT_PAREN')) {
            do {
                params.push(this.consume('IDENTIFIER', 'Expected parameter name').literal);
            } while (this.match('COMMA'));
        }
        
        this.consume('RIGHT_PAREN', 'Expected ) after parameters');
        this.consume('LEFT_BRACE', 'Expected { before function body');
        
        const body = this.parseBlock();
        
        return {
            type: 'FunctionDeclaration',
            name,
            params,
            body,
            async: isAsync
        };
    }
    
    // Await expression parsing
    parseAwaitExpression() {
        this.consume('AWAIT', 'Expected await keyword');
        const argument = this.parseExpression();
        return {
            type: 'AwaitExpression',
            argument
        };
    }
    
    parseBlock() {
        const statements = [];
        
        while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
            const statementStart = this.current;
            try {
                statements.push(this.parseStatement());
            } catch (error) {
                this.current = statementStart;
                const raw = this.parseLooseStatementUntilBoundary();
                if (raw) {
                    statements.push(raw);
                } else if (this.current === statementStart) {
                    this.advance();
                }
            }
        }
        
        this.consume('RIGHT_BRACE', 'Expected } after block');
        return statements;
    }
    
    // Control flow parsing
    parseIfStatement() {
        this.advance(); // consume 'ngati'
        this.consume('LEFT_PAREN', 'Expected ( after ngati');
        const condition = this.parseExpression();
        this.consume('RIGHT_PAREN', 'Expected ) after condition');
        this.consume('LEFT_BRACE', 'Expected { after condition');
        
        const thenBranch = this.parseBlock();
        let elseBranch = null;
        
        if (this.check('ELSE')) {
            this.advance(); // consume 'kapena'
            if (this.check('IF')) {
                // else if
                elseBranch = this.parseIfStatement();
            } else {
                this.consume('LEFT_BRACE', 'Expected { after kapena');
                elseBranch = this.parseBlock();
            }
        }
        
        return {
            type: 'IfStatement',
            condition,
            thenBranch,
            elseBranch
        };
    }
    
    parseForStatement() {
        this.advance(); // consume 'kwa'
        this.consume('LEFT_PAREN', 'Expected ( after kwa');
        
        const variable = this.consume('IDENTIFIER', 'Expected variable name');
        this.consume('IN', 'Expected mu');
        const iterable = this.parseExpression();
        
        this.consume('RIGHT_PAREN', 'Expected ) after for loop');
        this.consume('LEFT_BRACE', 'Expected { after for loop');
        
        const body = this.parseBlock();
        
        return {
            type: 'ForStatement',
            variable: variable.literal || variable.value,
            iterable,
            body
        };
    }
    
    parseWhileStatement() {
        this.advance(); // consume 'pamene'
        this.consume('LEFT_PAREN', 'Expected ( after pamene');
        const condition = this.parseExpression();
        this.consume('RIGHT_PAREN', 'Expected ) after condition');
        this.consume('LEFT_BRACE', 'Expected { after condition');
        
        const body = this.parseBlock();
        
        return {
            type: 'WhileStatement',
            condition,
            body
        };
    }
    
    parseTryStatement() {
        this.advance(); // consume 'linga'
        this.consume('LEFT_BRACE', 'Expected { after linga');
        const tryBlock = this.parseBlock();
        
        let catchBlock = null;
        let finallyBlock = null;
        
        if (this.check('CATCH')) {
            this.advance(); // consume 'kwata'
            this.consume('LEFT_PAREN', 'Expected ( after kwata');
            const errorVar = this.consume('IDENTIFIER', 'Expected error variable name');
            this.consume('RIGHT_PAREN', 'Expected ) after error variable');
            this.consume('LEFT_BRACE', 'Expected { after error variable');
            catchBlock = {
                error: errorVar.literal || errorVar.value,
                body: this.parseBlock()
            };
        }
        
        if (this.check('FINALLY')) {
            this.advance(); // consume 'paumalilo'
            this.consume('LEFT_BRACE', 'Expected { after paumalilo');
            finallyBlock = this.parseBlock();
        }
        
        return {
            type: 'TryStatement',
            tryBlock,
            catchBlock,
            finallyBlock
        };
    }
    
    // Utility methods
    extractDependencies(program) {
        const dependencies = [];
        
        for (const statement of program.statements) {
            if (statement.type === 'Import') {
                dependencies.push(statement.source);
            }
        }
        
        return dependencies;
    }
    
    buildDependencyGraph() {
        for (const [filePath, module] of this.modules) {
            this.dependencies.set(filePath, module.dependencies);
        }
    }
    
    validateModules() {
        for (const [filePath, module] of this.modules) {
            const errors = ASTUtils.validateAST(module);
            if (errors.length > 0) {
                this.errors.push(`Validation errors in ${filePath}: ${errors.join(', ')}`);
            }
        }
    }
    
    // Token utilities
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    
    check(type) {
        this.skipTrivia();
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }
    
    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }
    
    isAtEnd() {
        return this.peek().type === 'EOF';
    }
    
    peek() {
        return this.tokens[this.current];
    }
    
    previous() {
        return this.tokens[this.current - 1];
    }
    
    consume(type, message) {
        if (this.check(type)) return this.advance();
        throw new Error(message);
    }
    
    checkKeyword(keyword) {
        this.skipTrivia();
        if (this.isAtEnd()) return false;
        const token = this.peek();
        return token.type === 'IDENTIFIER' && token.literal === keyword;
    }
    
    matchKeyword(keyword) {
        if (this.checkKeyword(keyword)) {
            this.advance();
            return true;
        }
        return false;
    }
    
    consumeKeyword(keyword, message) {
        if (this.checkKeyword(keyword)) return this.advance();
        throw new Error(message);
    }
    
    parseInlineObject() {
        this.consume('LEFT_BRACE', 'Expected {');
        const properties = {};
        let rawPropertyIndex = 0;
        
        if (!this.check('RIGHT_BRACE')) {
            do {
                let keyToken;
                if (this.check('STRING') || this.check('IDENTIFIER') || this.isKeywordToken(this.peek().type)) {
                    keyToken = this.advance();
                } else {
                    keyToken = { literal: this.tokenToSource(this.advance()) };
                }
                
                if (!this.match('COLON')) {
                    this.current = Math.max(0, this.current - 1);
                    const raw = this.parseLooseValueUntilBoundary();
                    properties[`__raw_${rawPropertyIndex++}`] = raw;
                    continue;
                }
                
                const valueStart = this.current;
                let value;
                try {
                    value = this.parseExpression();
                } catch (error) {
                    this.current = valueStart;
                    value = this.parseLooseValueUntilBoundary();
                }
                
                properties[keyToken.literal || keyToken.value] = value;
            } while (this.match('COMMA'));
        }
        
        this.consume('RIGHT_BRACE', 'Expected }');
        return { type: 'ObjectLiteral', properties };
    }
    
    parseInlineArray() {
        this.consume('LEFT_BRACKET', 'Expected [');
        const elements = [];
        
        if (!this.check('RIGHT_BRACKET')) {
            do {
                const valueStart = this.current;
                let value;
                try {
                    value = this.parseExpression();
                } catch (error) {
                    this.current = valueStart;
                    value = this.parseLooseValueUntilBoundary(['COMMA', 'RIGHT_BRACKET']);
                }
                elements.push(value);
            } while (this.match('COMMA'));
        }
        
        this.consume('RIGHT_BRACKET', 'Expected ]');
        return { type: 'ArrayLiteral', elements };
    }
    
    parseLooseValueUntilBoundary(boundaryTypes = ['COMMA', 'RIGHT_BRACE']) {
        const start = this.current;
        let parenDepth = 0;
        let braceDepth = 0;
        let bracketDepth = 0;
        
        while (!this.isAtEnd()) {
            const token = this.peek();
            if (
                parenDepth === 0 &&
                braceDepth === 0 &&
                bracketDepth === 0 &&
                boundaryTypes.includes(token.type)
            ) {
                break;
            }
            
            if (token.type === 'LEFT_PAREN') parenDepth++;
            else if (token.type === 'RIGHT_PAREN' && parenDepth > 0) parenDepth--;
            else if (token.type === 'LEFT_BRACE') braceDepth++;
            else if (token.type === 'RIGHT_BRACE') {
                if (braceDepth === 0 && boundaryTypes.includes('RIGHT_BRACE')) break;
                if (braceDepth > 0) braceDepth--;
            } else if (token.type === 'LEFT_BRACKET') bracketDepth++;
            else if (token.type === 'RIGHT_BRACKET' && bracketDepth > 0) bracketDepth--;
            
            this.advance();
        }
        
        const rawTokens = this.tokens.slice(start, this.current);
        const raw = rawTokens.map((token) => this.tokenToSource(token)).join(' ').trim();
        return { type: 'RawValue', raw };
    }
    
    parseLooseStatementUntilBoundary() {
        const start = this.current;
        while (!this.isAtEnd() && !this.check('RIGHT_BRACE') && !this.check('SEMICOLON') && !this.check('NEWLINE')) {
            this.advance();
        }
        
        if (this.check('SEMICOLON')) this.advance();
        const rawTokens = this.tokens.slice(start, this.current);
        if (rawTokens.length === 0) return null;
        
        return {
            type: 'RawStatement',
            raw: rawTokens.map((token) => this.tokenToSource(token)).join(' ').trim()
        };
    }
    
    tokenToSource(token) {
        if (!token) return '';
        if (token.lexeme && token.lexeme.length > 0) return token.lexeme;
        if (token.literal !== null && token.literal !== undefined) return String(token.literal);
        return '';
    }
    
    isKeywordToken(type) {
        const keywordTokenTypes = new Set([
            'COMPONENT_DEF', 'PAGE_DEF', 'PROPS', 'STATE', 'CONSTRUCTOR', 'RENDER',
            'DATA_FETCHING', 'RETURN', 'FUNCTION', 'ASYNC', 'AWAIT', 'THIS',
            'IF', 'ELSE', 'FOR', 'IN', 'WHILE', 'DO', 'TRY', 'CATCH', 'FINALLY',
            'SWITCH', 'CASE', 'BREAK', 'CONTINUE'
        ]);
        return keywordTokenTypes.has(type);
    }
    
    skipTrivia() {
        while (!this.isAtEnd() && this.peek().type === 'NEWLINE') {
            this.current++;
        }
    }
    
    /**
     * Compile page/component source to HTML (new syntax) or legacy HTML.
     * @param {string} code
     * @param {object} [options]
     * @param {string} [options.projectRoot] - Enables `amapeji/umusango.bemba`, `ingisa`, and static `import` resolution
     * @param {string} [options.currentPath] - URL path for active nav, e.g. `/contact`
     * @param {string} [options.pageFilePath] - Absolute path to this `.bemba` file (required for relative `import`)
     * @param {string} [options.layoutCode] - Inline shell source override (rare; normally read from disk)
     * @param {string} [options.htmlLang] - `<html lang>` (BCP 47), default `en`
     * @param {string} [options.headExtra] - Trusted HTML fragment inserted in `<head>` after `<title>`
     * @param {boolean} [options.bembaSiteScript] - Append `<script src="/bemba-site.js" defer>` before `</body>`
     */
    compile(code, options = {}) {
        try {
            // Simple compilation for pangaWebusaiti syntax
            if (code.includes('pangaWebusaiti')) {
                return this.compileOldSyntax(code);
            } else {
                // For new syntax, use the full pipeline
                return this.compileNewSyntax(code, options);
            }
        } catch (error) {
            throw new Error(`Compilation error: ${error.message}`);
        }
    }
    
    compileOldSyntax(code) {
        // Simple HTML generation for old pangaWebusaiti syntax
        const appName = this.extractAppName(code);
        const sections = this.extractSections(code);
        const styles = this.extractStyles(code);
        
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        body { 
            background: #fafafa;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            color: #171717;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .grid {
            display: grid;
            grid-template-rows: 20px 1fr 20px;
            align-items: center;
            justify-items: center;
            min-height: 100vh;
            padding: 2rem;
            padding-bottom: 5rem;
            gap: 4rem;
        }
        
        @media (min-width: 640px) {
            .grid {
                padding: 5rem;
            }
        }
        
        main {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            grid-row-start: 2;
            align-items: center;
        }
        
        @media (min-width: 640px) {
            main {
                align-items: flex-start;
            }
        }
        
        .bemba-logo {
            width: 180px;
            height: 38px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }
        
        ol {
            list-style: decimal;
            list-style-position: inside;
            text-align: center;
            font-size: 0.875rem;
            line-height: 1.5rem;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        }
        
        @media (min-width: 640px) {
            ol {
                text-align: left;
            }
        }
        
        li {
            margin-bottom: 0.5rem;
            letter-spacing: -0.01em;
        }
        
        code {
            background: rgba(0, 0, 0, 0.05);
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-weight: 600;
        }
        
        @media (prefers-color-scheme: dark) {
            code {
                background: rgba(255, 255, 255, 0.06);
            }
        }
        
        .button-container {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-direction: column;
        }
        
        @media (min-width: 640px) {
            .button-container {
                flex-direction: row;
            }
        }
        
        .ibatani {
            border-radius: 9999px;
            border: 1px solid transparent;
            transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #000000;
            color: #fafafa;
            gap: 0.5rem;
            font-weight: 500;
            font-size: 0.875rem;
            line-height: 1.25rem;
            height: 2.5rem;
            padding-left: 1rem;
            padding-right: 1rem;
            cursor: pointer;
            text-decoration: none;
        }
        
        .ibatani:hover {
            background: #404040;
        }
        
        .ibatani.secondary {
            background: transparent;
            color: #000000;
            border-color: rgba(0, 0, 0, 0.08);
        }
        
        .ibatani.secondary:hover {
            background: #f2f2f2;
            border-color: transparent;
        }
        
        @media (min-width: 640px) {
            .ibatani {
                font-size: 1rem;
                line-height: 1.5rem;
                height: 3rem;
                padding-left: 1.25rem;
                padding-right: 1.25rem;
            }
            
            .ibatani.secondary {
                width: 100%;
            }
        }
        
        @media (min-width: 768px) {
            .ibatani.secondary {
                width: 158px;
            }
        }
        
        @media (prefers-color-scheme: dark) {
            .ibatani:hover {
                background: #cccccc;
            }
            
            .ibatani.secondary {
                border-color: rgba(255, 255, 255, 0.145);
            }
            
            .ibatani.secondary:hover {
                background: #1a1a1a;
            }
        }
        
        footer {
            grid-row-start: 3;
            display: flex;
            gap: 1.5rem;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
        }
        
        .footer-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #171717;
            text-decoration: none;
        }
        
        .footer-link:hover {
            text-decoration: underline;
            text-underline-offset: 4px;
        }
        
        .footer-icon {
            width: 16px;
            height: 16px;
        }
        
        ${styles}
    </style>
</head>
<body class="antialiased">
    <div class="grid">
        <main>
            <div class="bemba-logo">BembaJS</div>
            <ol>
                <li>Get started by editing <code>app/page.bemba</code>.</li>
                <li>Save and see your changes instantly.</li>
            </ol>
            <div class="button-container">`;
        
        if (sections.length > 0 && sections[0].amabatani && sections[0].amabatani.length > 0) {
            sections[0].amabatani.forEach((button, index) => {
                const onClick = button.pakuKlikisha || 'londolola("Button clicked!")';
                const isSecondary = index > 0;
                const buttonClass = isSecondary ? 'ibatani secondary' : 'ibatani';
                html += `
                <button class="${buttonClass}" onclick="${encodeJsForHtmlDoubleQuotedAttr(onClick)}">${button.ilembo || 'Button'}</button>`;
            });
        } else {
            html += `
                <button class="ibatani" onclick="londolola('Deploy now!')">Deploy now</button>
                <button class="ibatani secondary" onclick="londolola('Read our docs!')">Read our docs</button>`;
        }
        
        html += `
            </div>
        </main>
        <footer>
            <a class="footer-link" href="#" onclick="londolola('Learn more!')">
                <span class="footer-icon">📄</span>
                Learn
            </a>
            <a class="footer-link" href="#" onclick="londolola('View examples!')">
                <span class="footer-icon">🪟</span>
                Examples
            </a>
            <a class="footer-link" href="#" onclick="londolola('Go to BembaJS!')">
                <span class="footer-icon">🌐</span>
                Go to bembajs.dev →
            </a>
        </footer>
    </div>
    <script>
        // BembaJS runtime functions
        function londolola(message) {
            alert(message);
        }
        
        function pangaIpepa(title, content) {
            console.log('Page:', title, content);
        }
        
        function fyambaIcipanda(name, props) {
            console.log('Component:', name, props);
        }
    </script>
</body>
</html>`;
        
        return html;
    }
    
    compileNewSyntax(code, options = {}) {
        const projectRoot = options.projectRoot;
        let layoutCode = options.layoutCode;
        if (layoutCode == null && projectRoot) {
            const layoutPath = path.join(projectRoot, BEMBA_FOLDERS.PAGES, BEMBA_FILES.SITE_SHELL);
            if (fs.existsSync(layoutPath)) {
                layoutCode = fs.readFileSync(layoutPath, 'utf8');
            }
        }

        const siteLayout = this.extractSiteLayoutFromNewSyntax(code);
        const useSharedShell = Boolean(siteLayout && layoutCode);
        const shellSource = useSharedShell ? layoutCode : code;

        const siteName = siteLayout ? this.extractSiteNameFromNewSyntax(shellSource) : '';
        const navLinks = siteLayout ? this.extractNavLinksFromNewSyntax(shellSource) : [];
        const navUtilityLinks = siteLayout ? this.extractUtilityNavLinksFromNewSyntax(shellSource) : [];
        const footerTagline = siteLayout ? this.extractFooterTaglineFromNewSyntax(shellSource) : '';
        const footerDirectory = siteLayout ? this.extractFooterDirectoryFromNewSyntax(shellSource) : [];
        const footerCopyright = siteLayout ? this.extractFooterCopyrightFromNewSyntax(shellSource) : '';
        const footerLegalLinks = siteLayout ? this.extractFooterLegalLinksFromNewSyntax(shellSource) : [];

        const pageStyles = this.extractStylesFromNewSyntax(code);
        const layoutStyles = useSharedShell ? this.extractStylesFromNewSyntax(layoutCode) : '';
        let styles = [layoutStyles, pageStyles].filter(Boolean).join('\n\n');

        const ingisaNames = projectRoot ? this.extractIngisaNames(code) : [];
        const partialBundle = this.loadIngisaPartials(projectRoot, ingisaNames);

        const pageFilePath = options.pageFilePath ? String(options.pageFilePath) : '';
        const importBundle =
            projectRoot && pageFilePath
                ? this.loadStaticImportsFromPage(projectRoot, pageFilePath, code)
                : { navShell: null, bodyHtml: '', bodyCss: '', skippedDynamic: [] };

        if (importBundle.bodyCss) {
            styles = [styles, importBundle.bodyCss].filter(Boolean).join('\n\n');
        }
        if (partialBundle.css) {
            styles = [styles, partialBundle.css].filter(Boolean).join('\n\n');
        }

        const brandName = siteName || 'BembaJS';
        const activePath = options.currentPath != null ? String(options.currentPath) : '';

        let navShellForFill = null;
        let navShellExtraCss = '';
        if (importBundle.navShell && String(importBundle.navShell.html).trim()) {
            navShellForFill = importBundle.navShell;
            if (partialBundle.navShell && partialBundle.navShell.css) {
                navShellExtraCss = partialBundle.navShell.css;
            }
        } else if (partialBundle.navShell && String(partialBundle.navShell.html).trim()) {
            navShellForFill = partialBundle.navShell;
        }

        let navShellFilledHtml = '';
        if (navShellForFill && String(navShellForFill.html).trim()) {
            const navCssMerged = [navShellForFill.css, navShellExtraCss].filter(Boolean).join('\n\n');
            if (navCssMerged) {
                styles = [styles, navCssMerged].filter(Boolean).join('\n\n');
            }
            navShellFilledHtml = fillNavShellPlaceholders(
                navShellForFill.html,
                brandName,
                navLinks,
                activePath
            );
        }

        const partialsHtmlMerged = [importBundle.bodyHtml, partialBundle.html].filter(Boolean).join('\n');

        const appName = this.extractAppNameFromNewSyntax(code);
        const sections = this.extractSectionsFromNewSyntax(code, appName);
        const bodyBlocks = this.extractIfiputulwaBlocks(code);

        const htmlLang = options.htmlLang != null ? String(options.htmlLang) : 'en';
        const headExtra = options.headExtra != null ? String(options.headExtra) : '';
        const bembaSiteScript = Boolean(options.bembaSiteScript);

        return this.generateModernLayout(appName, sections, styles, {
            siteLayout,
            siteName,
            navLinks,
            navUtilityLinks,
            footerTagline,
            footerDirectory,
            footerCopyright,
            footerLegalLinks,
            bodyBlocks,
            activePath,
            partialsHtml: partialsHtmlMerged,
            navShellFilledHtml,
            htmlLang,
            headExtra,
            bembaSiteScript
        });
    }

    /**
     * Files that affect static HTML output for a `pangaIpepa` page (for tooling / fine-grained cache invalidation).
     * Includes the page file, `umusango.bemba` when used, `ingisa` partials that exist on disk, and resolved static imports.
     * With `transitive` (default `true`), also follows `import` and `ingisa` inside those partials recursively.
     * @param {string} code - Page source
     * @param {object} options
     * @param {string} options.projectRoot
     * @param {string} [options.pageFilePath] - Absolute path to the page `.bemba`
     * @param {boolean} [options.transitive=true]
     * @returns {string[]} Sorted absolute paths (existing files only)
     */
    listStaticPageDependencyPaths(code, options = {}) {
        if (!code || typeof code !== 'string' || !code.includes('pangaIpepa')) {
            return [];
        }
        const projectRoot = options.projectRoot;
        const pageFilePath = options.pageFilePath ? String(options.pageFilePath) : '';
        const transitive = options.transitive !== false;
        const seen = new Set();
        const add = (p) => {
            if (!p) return;
            try {
                const abs = path.normalize(path.resolve(p));
                if (fs.existsSync(abs)) seen.add(abs);
            } catch (_) {
                /* ignore */
            }
        };

        if (pageFilePath) add(pageFilePath);
        if (!projectRoot) {
            return Array.from(seen).sort();
        }

        const siteLayout = this.extractSiteLayoutFromNewSyntax(code);
        const shellPath = path.join(projectRoot, BEMBA_FOLDERS.PAGES, BEMBA_FILES.SITE_SHELL);
        if (siteLayout) add(shellPath);

        const ingisaNames = this.extractIngisaNames(code);
        for (const n of ingisaNames) {
            const fp = this.resolveIngisaPartialFilePath(projectRoot, n);
            if (fp) add(fp);
        }

        if (pageFilePath) {
            const absPage = path.resolve(pageFilePath);
            let importNodes = [];
            try {
                importNodes = this.parseLeadingImportStatements(code);
            } catch (_) {
                importNodes = [];
            }
            for (const imp of importNodes) {
                if (!imp || imp.type !== 'Import') continue;
                const r = resolveBembaImportPath(projectRoot, absPage, imp.source);
                if (r) add(r);
            }
        }

        if (!transitive) {
            return Array.from(seen).sort();
        }

        const visitedBody = new Set();
        const queue = Array.from(seen).filter((p) => typeof p === 'string' && p.endsWith('.bemba'));

        while (queue.length > 0) {
            const fp = queue.pop();
            const abs = path.normalize(path.resolve(fp));
            if (!abs.endsWith('.bemba') || !fs.existsSync(abs)) continue;
            if (visitedBody.has(abs)) continue;
            visitedBody.add(abs);

            let src = '';
            try {
                src = fs.readFileSync(abs, 'utf8');
            } catch (_) {
                continue;
            }

            let importNodes = [];
            try {
                importNodes = this.parseLeadingImportStatements(src);
            } catch (_) {
                importNodes = [];
            }
            for (const imp of importNodes) {
                if (!imp || imp.type !== 'Import') continue;
                const r = resolveBembaImportPath(projectRoot, abs, imp.source);
                if (r) {
                    add(r);
                    queue.push(r);
                }
            }

            for (const n of this.extractIngisaNames(src)) {
                const p2 = this.resolveIngisaPartialFilePath(projectRoot, n);
                if (p2) {
                    add(p2);
                    queue.push(p2);
                }
            }
        }

        return Array.from(seen).sort();
    }

    /** Backtick field e.g. ibeensi: `...` (trusted HTML from author). */
    extractBacktickField(source, key) {
        const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const m = source.match(new RegExp(esc + ':\\s*`([\\s\\S]*?)`'));
        return m ? m[1] : '';
    }

    /** Page lists partials: ingisa: [ 'Card', 'Promo' ] → loads ifikopo/Card.bemba, etc. */
    extractIngisaNames(code) {
        const inner = this.extractArrayBlockAfterKey(code, 'ingisa');
        if (!inner) return [];
        const names = [];
        const re = /['"]([a-zA-Z0-9_-]+)['"]/g;
        let m;
        while ((m = re.exec(inner)) !== null) {
            names.push(m[1]);
        }
        return names;
    }

    /**
     * Partial file: pangaIcapaba({ ibeensi: `raw HTML`, imikalile: `css` })
     */
    extractPangaIcapabaPartial(source) {
        if (!/\bpangaIcapaba\s*\(/.test(source)) {
            return { html: '', css: '' };
        }
        const html = this.extractBacktickField(source, 'ibeensi') || '';
        const css = this.extractStylesFromNewSyntax(source);
        return { html, css };
    }

    /** Resolve `ifikopo/<Name>.bemba` or `ifikopo/cipanda/<Name>.bemba` when present. */
    resolveIngisaPartialFilePath(projectRoot, rawName) {
        const safe = String(rawName).replace(/[^a-zA-Z0-9_-]/g, '');
        if (!safe || !projectRoot) return null;
        const rootPart = path.join(projectRoot, BEMBA_FOLDERS.COMPONENTS, `${safe}.bemba`);
        const nestedPart = path.join(projectRoot, BEMBA_FOLDERS.COMPONENTS, 'cipanda', `${safe}.bemba`);
        if (fs.existsSync(rootPart)) return rootPart;
        if (fs.existsSync(nestedPart)) return nestedPart;
        return null;
    }

    loadIngisaPartials(projectRoot, names) {
        if (!projectRoot || !names || !names.length) {
            return { html: '', css: '', navShell: null };
        }
        const htmlParts = [];
        const cssParts = [];
        let navShell = null;
        const navName = BEMBA_INGISA.NAV_BAR;
        for (const rawName of names) {
            const safe = String(rawName).replace(/[^a-zA-Z0-9_-]/g, '');
            if (!safe) continue;
            const fp = this.resolveIngisaPartialFilePath(projectRoot, rawName);
            if (!fp) continue;
            let src;
            try {
                src = fs.readFileSync(fp, 'utf8');
            } catch (_) {
                continue;
            }
            const frag = this.extractPangaIcapabaPartial(src);
            if (safe === navName) {
                navShell = { html: frag.html || '', css: frag.css || '' };
                continue;
            }
            if (frag.html) {
                htmlParts.push(
                    `<div class="bemba-ingisa" data-ingisa="${safe.replace(/"/g, '')}">${frag.html}</div>`
                );
            }
            if (frag.css) cssParts.push(frag.css);
        }
        return { html: htmlParts.join('\n'), css: cssParts.join('\n\n'), navShell };
    }

    /**
     * Parse only leading `import … from '…'` lines (same grammar as the AST path).
     * Stops at the first non-import token so `pangaIpepa` / comments / blank lines after imports work.
     */
    parseLeadingImportStatements(code) {
        this.tokens = this.lexer.tokenize(code);
        this.current = 0;
        this.errors = [];
        const imports = [];
        while (true) {
            while (!this.isAtEnd()) {
                const t = this.peek().type;
                if (t === 'NEWLINE' || t === 'WHITESPACE' || t === 'COMMENT') {
                    this.advance();
                } else {
                    break;
                }
            }
            if (this.isAtEnd()) break;
            if (!this.checkKeyword('import')) break;
            imports.push(this.parseImport());
            while (!this.isAtEnd()) {
                const t = this.peek().type;
                if (t === 'NEWLINE' || t === 'WHITESPACE' || t === 'COMMENT') {
                    this.advance();
                } else {
                    break;
                }
            }
            while (this.match('SEMICOLON')) {
                while (!this.isAtEnd()) {
                    const t2 = this.peek().type;
                    if (t2 === 'NEWLINE' || t2 === 'WHITESPACE' || t2 === 'COMMENT') {
                        this.advance();
                    } else {
                        break;
                    }
                }
            }
        }
        return imports;
    }

    /**
     * Static HTML: resolve default imports to .bemba files; merge pangaIcapaba into layout.
     * fyambaIcipanda-only modules are skipped here (use maapi / emit-react for dynamic UI).
     */
    loadStaticImportsFromPage(projectRoot, pageFilePath, code) {
        const emptyOut = () => ({
            navShell: null,
            bodyHtml: '',
            bodyCss: '',
            skippedDynamic: []
        });
        if (!projectRoot || !pageFilePath) return emptyOut();
        const absPage = path.resolve(pageFilePath);
        if (!fs.existsSync(absPage)) return emptyOut();
        let importNodes;
        try {
            importNodes = this.parseLeadingImportStatements(code);
        } catch (_) {
            return emptyOut();
        }
        if (!importNodes.length) return emptyOut();

        const htmlParts = [];
        const cssParts = [];
        const skippedDynamic = [];
        let navShell = null;

        for (const imp of importNodes) {
            if (!imp || imp.type !== 'Import') continue;
            const resolved = resolveBembaImportPath(projectRoot, absPage, imp.source);
            if (!resolved) continue;

            let fileSrc;
            try {
                fileSrc = fs.readFileSync(resolved, 'utf8');
            } catch (_) {
                continue;
            }

            const base = path.basename(resolved, '.bemba');
            const local =
                (imp.specifiers && imp.specifiers.find((s) => s.isDefault))?.name ||
                (imp.specifiers && imp.specifiers[0]?.name) ||
                base;

            const hasPartial = /\bpangaIcapaba\s*\(/.test(fileSrc);
            const hasComponent = /\bfyambaIcipanda\s*\(/.test(fileSrc);

            if (hasComponent && !hasPartial) {
                skippedDynamic.push(local || base);
                continue;
            }

            if (hasPartial) {
                const frag = this.extractPangaIcapabaPartial(fileSrc);
                const isNav =
                    local === BEMBA_INGISA.NAV_BAR ||
                    base === BEMBA_INGISA.NAV_BAR ||
                    (frag.html && frag.html.includes('{{BEMBA_NAV_BRAND}}'));

                if (isNav && String(frag.html).trim()) {
                    navShell = { html: frag.html, css: frag.css || '' };
                } else {
                    const tag = String(local || base).replace(/"/g, '');
                    if (frag.html) {
                        htmlParts.push(
                            `<div class="bemba-ingisa" data-ingisa="${tag}">${frag.html}</div>`
                        );
                    }
                    if (frag.css) cssParts.push(frag.css);
                }
            }
        }

        return {
            navShell,
            bodyHtml: htmlParts.join('\n'),
            bodyCss: cssParts.join('\n\n'),
            skippedDynamic
        };
    }
    
    extractAppNameFromNewSyntax(code) {
        const match = code.match(/pangaIpepa\s*\(\s*["']([^"']+)["']/);
        return match ? match[1] : 'BembaJS App';
    }
    
    extractSectionsFromNewSyntax(code, appName = 'BembaJS App') {
        const sections = [];
        const idx = code.indexOf('ifiputulwa:');
        const heroSlice = idx >= 0 ? code.slice(0, idx) : code;

        const titleMatch = heroSlice.match(/umutwe:\s*["']([^"']*)["']/);
        const leadFromField = this.extractQuotedField(heroSlice, 'ilyashi');
        const blocks = this.extractIfiputulwaBlocks(code);

        let heroButtons = [];
        if (blocks.length > 0 && blocks[0].buttons.length > 0) {
            heroButtons = blocks[0].buttons;
        } else {
            heroButtons = this.extractButtonsFromNewSyntax(code);
        }

        const title = titleMatch ? titleMatch[1] : '';
        const content =
            leadFromField ||
            (idx < 0 ? (code.match(/ilyashi:\s*["']([^"']*)["']/) || [])[1] : '') ||
            '';

        if (title || content || heroButtons.length) {
            sections.push({
                title: title || 'Get started by editing',
                content:
                    content ||
                    (title ? '' : 'Save and see your changes instantly.'),
                buttons: heroButtons
            });
        } else if (blocks.length > 0) {
            sections.push({
                title: appName,
                content: '',
                buttons: heroButtons
            });
        }

        return sections;
    }

    /** Read ilyashi / long strings with `'` inside using "..." or '...' with escapes. */
    extractQuotedField(source, key) {
        const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const sq = new RegExp(esc + ":\\s*'((?:\\\\.|[^'\\\\])*)'", 's');
        const dq = new RegExp(esc + ':\\s*"((?:\\\\.|[^"\\\\])*)"', 's');
        let m = source.match(sq);
        if (m) {
            return m[1].replace(/\\(.)/g, (_, ch) => (ch === 'n' ? '\n' : ch));
        }
        m = source.match(dq);
        if (m) {
            return m[1].replace(/\\(.)/g, (_, ch) => (ch === 'n' ? '\n' : ch));
        }
        return '';
    }

    /** Split top-level `{ ... }` objects inside an array body (handles nested `amabatani: [ { } ]`). */
    splitTopLevelBraceObjects(inner) {
        const objs = [];
        let i = 0;
        const s = inner;
        while (i < s.length) {
            while (i < s.length && /\s/.test(s[i])) {
                i++;
            }
            if (i >= s.length) break;
            if (s[i] !== '{') {
                i++;
                continue;
            }
            let depth = 0;
            const start = i;
            let inStr = false;
            let q = '';
            let esc = false;
            for (; i < s.length; i++) {
                const c = s[i];
                if (inStr) {
                    if (esc) {
                        esc = false;
                        continue;
                    }
                    if (c === '\\') {
                        esc = true;
                        continue;
                    }
                    if (c === q) {
                        inStr = false;
                    }
                    continue;
                }
                if (c === '"' || c === "'" || c === '`') {
                    inStr = true;
                    q = c;
                    continue;
                }
                if (c === '{') depth++;
                else if (c === '}') {
                    depth--;
                    if (depth === 0) {
                        objs.push(s.slice(start, i + 1));
                        i++;
                        break;
                    }
                }
            }
        }
        return objs;
    }

    /** Each ifiputulwa entry → { title, content, buttons } for page body sections. */
    extractIfiputulwaBlocks(code) {
        const inner = this.extractArrayBlockAfterKey(code, 'ifiputulwa');
        if (!inner) return [];
        const chunks = this.splitTopLevelBraceObjects(inner);
        const out = [];
        for (const obj of chunks) {
            const t = this.extractQuotedField(obj, 'umutwe') || obj.match(/umutwe:\s*["']([^"']*)["']/)?.[1] || '';
            const c =
                this.extractQuotedField(obj, 'ilyashi') || obj.match(/ilyashi:\s*["']([^"']*)["']/)?.[1] || '';
            const buttons = this.extractButtonsFromNewSyntax(obj);
            if (t || c || buttons.length) {
                out.push({ title: t, content: c, buttons });
            }
        }
        return out;
    }
    
    extractButtonsFromNewSyntax(code) {
        const buttons = [];

        // Look for amabatani array in ifiputulwa (match full bracket span)
        const start = code.search(/amabatani:\s*\[/);
        if (start === -1) return buttons;
        const openBracket = code.indexOf('[', start);
        if (openBracket === -1) return buttons;
        let depth = 0;
        let i = openBracket;
        for (; i < code.length; i++) {
            const c = code[i];
            if (c === '[') depth++;
            else if (c === ']') {
                depth--;
                if (depth === 0) {
                    i++;
                    break;
                }
            }
        }
        const buttonContent = code.slice(openBracket + 1, i - 1);

        // pakuKlikisha may contain the other quote kind, e.g. 'londolola("hi")'
        const btnBlock = /\{\s*ilembo:\s*(["'])([^"']*)\1\s*,\s*pakuKlikisha:\s*(["'])/g;
        let m;
        while ((m = btnBlock.exec(buttonContent)) !== null) {
            const label = m[2];
            const q = m[3];
            const valueStart = m.index + m[0].length;
            let j = valueStart;
            let out = '';
            while (j < buttonContent.length) {
                const ch = buttonContent[j];
                if (ch === '\\' && j + 1 < buttonContent.length) {
                    out += ch + buttonContent[j + 1];
                    j += 2;
                    continue;
                }
                if (ch === q) break;
                out += ch;
                j++;
            }
            buttons.push({ label, onClick: out });
            let k = j + 1;
            while (k < buttonContent.length && buttonContent[k] !== '}') k++;
            btnBlock.lastIndex = k < buttonContent.length ? k + 1 : buttonContent.length;
        }

        return buttons;
    }
    
    extractStylesFromNewSyntax(code) {
        const tick = code.match(/imikalile:\s*`([\s\S]*?)`/);
        if (tick) return tick[1];
        const q = code.match(/imikalile:\s*["']([\s\S]*?)["']/);
        return q ? q[1] : '';
    }

    /**
     * Site chrome is opt-in (Bemba keys only):
     * - umusangoSite: ee
     * - ishinaLyabusite (navbar title)
     * - ilyashiPaMusule (footer ribbon line when using directory footer)
     * - inshilaNav: [ { ilembo, inshila }, ... ] (place before ifiputulwaPaMusule)
     * - inshilaCipali: optional utility links (right side of nav)
     * - ifiputulwaPaMusule: optional footer columns (replaces default BembaJS/GitHub links)
     * - ilyashiLupwaPaMusule, amalinkaLupwaPaMusule: copyright + legal row
     */
    extractSiteLayoutFromNewSyntax(code) {
        return /\bumusangoSite:\s*ee\b/i.test(code);
    }

    /** Navbar brand (ishinaLyabusite only). */
    extractSiteNameFromNewSyntax(code) {
        const m = code.match(/ishinaLyabusite:\s*["']([^"']*)["']/);
        return m ? m[1].trim() : '';
    }

    /** Footer tagline (ilyashiPaMusule only). */
    extractFooterTaglineFromNewSyntax(code) {
        const m = code.match(/ilyashiPaMusule:\s*["']([^"']*)["']/);
        return m ? m[1] : '';
    }

    /**
     * Navbar: inshilaNav only. Each link uses ilembo + inshila.
     */
    extractArrayBlockAfterKey(code, key) {
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(escaped + ':\\s*\\[');
        const m = re.exec(code);
        if (!m) return null;
        const openBracket = m.index + m[0].length - 1;
        let depth = 0;
        let i = openBracket;
        for (; i < code.length; i++) {
            const c = code[i];
            if (c === '[') depth++;
            else if (c === ']') {
                depth--;
                if (depth === 0) {
                    i++;
                    break;
                }
            }
        }
        return code.slice(openBracket + 1, i - 1);
    }

    extractNavLinksFromNewSyntax(code) {
        const inner = this.extractArrayBlockAfterKey(code, 'inshilaNav');
        if (!inner) return [];
        return parseNavLinkObjectsFromArrayInner(inner);
    }

    /**
     * Optional right-side nav shortcuts (`inshilaCipali`) — same shape as `inshilaNav`.
     * Put `inshilaNav` before `ifiputulwaPaMusule` in `umusango.bemba` so the main nav array is matched first.
     */
    extractUtilityNavLinksFromNewSyntax(code) {
        const inner = this.extractArrayBlockAfterKey(code, 'inshilaCipali');
        if (!inner) return [];
        return parseNavLinkObjectsFromArrayInner(inner);
    }

    /**
     * Footer directory columns: `[ { umutwe, inshilaNav: [ { ilembo, inshila }, ... ] }, ... ]`.
     * When non-empty, replaces the default BembaJS/GitHub footer promo links.
     */
    extractFooterDirectoryFromNewSyntax(code) {
        const inner = this.extractArrayBlockAfterKey(code, 'ifiputulwaPaMusule');
        if (!inner || !inner.trim()) return [];
        const cols = [];
        for (const block of extractTopLevelBraceObjectsFromArrayInner(inner)) {
            const tm = block.match(/\bumutwe:\s*["']([^"']*)["']/);
            if (!tm) continue;
            const title = tm[1];
            const navKey = block.search(/\binshilaNav:\s*\[/);
            if (navKey === -1) continue;
            const openIdx = block.indexOf('[', navKey);
            if (openIdx === -1) continue;
            let depth = 0;
            let j = openIdx;
            for (; j < block.length; j++) {
                const ch = block[j];
                if (ch === '[') depth++;
                else if (ch === ']') {
                    depth--;
                    if (depth === 0) {
                        const linksInner = block.slice(openIdx + 1, j);
                        const links = parseNavLinkObjectsFromArrayInner(linksInner);
                        cols.push({ title, links });
                        break;
                    }
                }
            }
        }
        return cols;
    }

    /** Single-line copyright / disclaimer above the legal links row (`ilyashiLupwaPaMusule`). */
    extractFooterCopyrightFromNewSyntax(code) {
        const m = code.match(/ilyashiLupwaPaMusule:\s*["']([^"']*)["']/);
        return m ? m[1] : '';
    }

    /** Legal / policy links (`amalinkaLupwaPaMusule`) — same shape as `inshilaNav`. */
    extractFooterLegalLinksFromNewSyntax(code) {
        const inner = this.extractArrayBlockAfterKey(code, 'amalinkaLupwaPaMusule');
        if (!inner) return [];
        return parseNavLinkObjectsFromArrayInner(inner);
    }
    
    generateModernLayout(appName, sections, styles, layoutOpts = {}) {
        const {
            siteLayout = false,
            siteName = '',
            navLinks = [],
            navUtilityLinks = [],
            footerTagline = '',
            footerDirectory = [],
            footerCopyright = '',
            footerLegalLinks = [],
            bodyBlocks = [],
            activePath = '',
            partialsHtml = '',
            navShellFilledHtml = '',
            htmlLang = 'en',
            headExtra = '',
            bembaSiteScript = false
        } = layoutOpts;
        const safeLang =
            htmlLang && /^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$/i.test(String(htmlLang).trim())
                ? String(htmlLang).trim()
                : 'en';
        const headExtraBlock = headExtra ? `\n    ${headExtra}` : '';
        const siteScriptBlock = bembaSiteScript ? '\n    <script src="/bemba-site.js" defer></script>' : '';
        const ingisaMotion = partialsHtml
            ? `
        .bemba-ingisa-root { width: 100%; max-width: 100%; }
        .bemba-ingisa { margin-top: 1.25rem; animation: bembaIngisaIn 0.42s ease-out both; }
        @keyframes bembaIngisaIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        `
            : '';
        const allStyles = ingisaMotion + (ingisaMotion && styles ? '\n' : '') + styles;
        const escapeHtml = (s) => {
            if (s == null || s === '') return '';
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        };

        // Use the same modern layout generation as compileOldSyntax
        const defaultButtons = [
            { label: 'Deploy now', onClick: 'window.open("https://vercel.com/new?utm_source=create-bembajs&utm_medium=appdir-template&utm_campaign=create-bembajs", "_blank")' },
            { label: 'Read our docs', onClick: 'window.open("https://bembajs.dev/docs", "_blank")' }
        ];
        
        let s0 = sections.length > 0 ? sections[0] : null;
        if (!s0) {
            s0 = {
                title: appName,
                content: 'Get started by editing amapeji/*.bemba.',
                buttons: defaultButtons
            };
        }

        const buttons =
            s0.buttons && s0.buttons.length > 0 ? s0.buttons : defaultButtons;

        const docTitle = s0.title ? s0.title : appName;
        const headline = s0.title ? s0.title : appName;
        let leadHtml = '';
        if (s0.content) {
            leadHtml = `<p class="page-lead">${escapeHtml(s0.content)}</p>`;
        } else if (sections.length === 0) {
            leadHtml = `<p class="page-lead">Get started by editing <code>amapeji/index.bemba</code>. Save the file and refresh this page.</p>`;
        }

        const rowHtml = (list) =>
            list
                .map(
                    (button, index) => `
                    <button type="button" class="ibatani ${index > 0 ? 'secondary' : ''}" onclick="${encodeJsForHtmlDoubleQuotedAttr(button.onClick)}">
                        ${escapeHtml(button.label)}
                    </button>`
                )
                .join('');

        const buttonHtml = rowHtml(buttons);

        const bodySectionsHtml = (bodyBlocks || [])
            .map((block, i) => {
                const hasText = !!(block.title || block.content);
                const secButtons =
                    i > 0 && block.buttons && block.buttons.length ? rowHtml(block.buttons) : '';
                if (!hasText && !secButtons) return '';
                const h = block.title
                    ? `<h2 class="body-section-title">${escapeHtml(block.title)}</h2>`
                    : '';
                const p = block.content
                    ? `<p class="body-section-lead">${escapeHtml(block.content)}</p>`
                    : '';
                const act = secButtons
                    ? `<div class="button-container body-section-actions">${secButtons}</div>`
                    : '';
                return `<article class="body-section">${h}${p}${act}</article>`;
            })
            .join('');

        const footerAnchors = `
            <a href="https://bembajs.dev" class="footer-link" target="_blank" rel="noopener noreferrer">
                <svg class="footer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                BembaJS
            </a>
            <a href="https://github.com/bembajs/bembajs" class="footer-link" target="_blank" rel="noopener noreferrer">
                <svg class="footer-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
            </a>`;

        if (!siteLayout) {
            return `<!DOCTYPE html>
<html lang="${safeLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(docTitle)}</title>${headExtraBlock}
    <style>
        * { box-sizing: border-box; }

        :root {
            --bg: #f4f4f5;
            --surface: #ffffff;
            --text: #18181b;
            --muted: #71717a;
            --border: rgba(24, 24, 27, 0.12);
            --accent: #3b2e8c;
            --accent-hover: #2d2269;
            --shadow: 0 1px 3px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.04);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg: #09090b;
                --surface: #18181b;
                --text: #fafafa;
                --muted: #a1a1aa;
                --border: rgba(250, 250, 250, 0.12);
                --accent: #8b7ce8;
                --accent-hover: #a89df0;
                --shadow: 0 1px 3px rgba(0,0,0,.4), 0 12px 40px rgba(0,0,0,.35);
            }
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }

        .grid {
            min-height: 100vh;
            display: grid;
            grid-template-rows: 1fr auto;
            padding: clamp(1.25rem, 4vw, 2.5rem);
            gap: 2rem;
        }

        main {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .shell {
            width: 100%;
            max-width: 36rem;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 1rem;
            padding: clamp(1.5rem, 4vw, 2.25rem);
            box-shadow: var(--shadow);
        }

        .brand {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1.25rem;
        }

        .brand-mark {
            width: 2.25rem;
            height: 2.25rem;
            border-radius: 0.5rem;
            background: linear-gradient(135deg, var(--accent) 0%, #c026d3 100%);
            box-shadow: 0 2px 8px rgba(59, 46, 140, 0.35);
        }

        .brand-name {
            font-weight: 700;
            font-size: 0.95rem;
            letter-spacing: -0.02em;
            color: var(--text);
        }

        .page-title {
            margin: 0 0 0.75rem;
            font-size: clamp(1.5rem, 4vw, 1.875rem);
            font-weight: 700;
            letter-spacing: -0.03em;
            line-height: 1.2;
            color: var(--text);
        }

        .page-lead {
            margin: 0;
            font-size: 1rem;
            color: var(--muted);
            max-width: 32rem;
        }

        .page-lead code {
            font-size: 0.875em;
        }

        code {
            font-family: ui-monospace, "Cascadia Code", "SF Mono", Monaco, Consolas, monospace;
            background: color-mix(in srgb, var(--text) 6%, transparent);
            padding: 0.15em 0.4em;
            border-radius: 0.35rem;
            font-weight: 500;
        }

        .button-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.65rem;
            margin-top: 1.5rem;
        }

        .ibatani {
            border-radius: 9999px;
            border: 1px solid transparent;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 2.75rem;
            padding: 0 1.15rem;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
            background: var(--accent);
            color: #fff;
        }

        .ibatani:hover {
            background: var(--accent-hover);
        }

        .ibatani:active {
            transform: scale(0.98);
        }

        .ibatani.secondary {
            background: transparent;
            color: var(--text);
            border-color: var(--border);
        }

        .ibatani.secondary:hover {
            background: color-mix(in srgb, var(--text) 6%, transparent);
        }

        .shell .site-body {
            width: 100%;
            margin-top: 0.25rem;
        }

        .shell .body-section {
            border-top: 1px solid var(--border);
            padding-top: 1.25rem;
            margin-top: 1.35rem;
        }

        .shell .body-section-title {
            font-size: 1.1rem;
            font-weight: 650;
            margin: 0 0 0.5rem;
            letter-spacing: -0.02em;
            color: var(--text);
        }

        .shell .body-section-lead {
            margin: 0;
            font-size: 0.9rem;
            color: var(--muted);
            line-height: 1.6;
        }

        .shell .body-section-actions {
            margin-top: 1rem;
        }

        footer {
            display: flex;
            flex-wrap: wrap;
            gap: 1.25rem;
            align-items: center;
            justify-content: center;
            padding-bottom: 0.5rem;
        }

        .footer-link {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.875rem;
            color: var(--muted);
            text-decoration: none;
        }

        .footer-link:hover {
            color: var(--text);
            text-decoration: underline;
            text-underline-offset: 3px;
        }

        .footer-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }

        ${allStyles}
    </style>
</head>
<body class="antialiased">
    <div class="grid">
        <main>
            <div class="shell">
                <div class="brand" aria-hidden="true">
                    <span class="brand-mark"></span>
                    <span class="brand-name">BembaJS</span>
                </div>
                <section class="hero" aria-labelledby="page-heading">
                    <h1 id="page-heading" class="page-title">${escapeHtml(headline)}</h1>
                    ${leadHtml}
                </section>
                <div class="button-container">${buttonHtml}</div>
                ${
                    bodySectionsHtml
                        ? `<div class="site-body" role="region" aria-label="Page sections">${bodySectionsHtml}</div>`
                        : ''
                }
                ${
                    partialsHtml
                        ? `<div class="bemba-ingisa-root" role="region" aria-label="Imported partials">${partialsHtml}</div>`
                        : ''
                }
            </div>
        </main>
        <footer>${footerAnchors}</footer>
    </div>
    <script>
        function londolola(message) {
            alert(message);
        }
        function pangaIpepa(title, content) {
            console.log('Page:', title, content);
        }
        function fyambaIcipanda(name, props) {
            console.log('Component:', name, props);
        }
        function pangaIcapaba(props) {
            console.log('Partial:', props);
        }
    </script>${siteScriptBlock}
</body>
</html>`;
        }

        const brandName = siteName || 'BembaJS';
        const useNavShell = Boolean(siteLayout && String(navShellFilledHtml || '').trim());
        const showInnerBrand = !useNavShell && navLinks.length === 0;
        const navUtilitiesHtml =
            navUtilityLinks && navUtilityLinks.length
                ? `<nav class="nav-utilities" aria-label="Shortcuts">
            ${navUtilityLinks
                .map((l) => {
                    const active = navHrefIsActive(l.href, activePath);
                    const cls = active ? 'nav-utility is-active' : 'nav-utility';
                    const cur = active ? ' aria-current="page"' : '';
                    return `<a href="${escapeHtml(l.href)}" class="${cls}"${cur}>${escapeHtml(l.label)}</a>`;
                })
                .join('')}
        </nav>`
                : '';

        const navBlock = useNavShell
            ? String(navShellFilledHtml).trim()
            : navLinks.length > 0
                ? `<header class="site-header">
    <div class="site-header-inner">
        <a href="/" class="nav-brand">${escapeHtml(brandName)}</a>
        <nav class="site-nav" aria-label="Main">
            ${navLinks
                .map((l) => {
                    const active = navHrefIsActive(l.href, activePath);
                    const cls = active ? 'nav-link is-active' : 'nav-link';
                    const cur = active ? ' aria-current="page"' : '';
                    return `<a href="${escapeHtml(l.href)}" class="${cls}"${cur}>${escapeHtml(l.label)}</a>`;
                })
                .join('')}
        </nav>
        ${navUtilitiesHtml}
    </div>
</header>`
                : '';
        const footerLead =
            footerTagline && String(footerTagline).trim()
                ? `<p class="footer-tagline">${escapeHtml(String(footerTagline).trim())}</p>`
                : '';

        const useCustomFooter = Boolean(footerDirectory && footerDirectory.length > 0);
        const footerDirectoryHtml = useCustomFooter
            ? `<div class="footer-directory" role="navigation" aria-label="Site directory">${footerDirectory
                  .map((col) => {
                      const title = escapeHtml(col.title || '');
                      const items = (col.links || [])
                          .map(
                              (l) =>
                                  `<li><a class="footer-col-link" href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a></li>`
                          )
                          .join('');
                      return `<div class="footer-col">
            <h3 class="footer-col-title">${title}</h3>
            <ul class="footer-col-list">${items}</ul>
        </div>`;
                  })
                  .join('')}</div>`
            : '';

        const footerLegalBlock =
            (footerCopyright && String(footerCopyright).trim()) ||
            (footerLegalLinks && footerLegalLinks.length)
                ? `<div class="footer-legal">
            ${
                footerCopyright && String(footerCopyright).trim()
                    ? `<p class="footer-legal-copy">${escapeHtml(String(footerCopyright).trim())}</p>`
                    : ''
            }
            ${
                footerLegalLinks && footerLegalLinks.length
                    ? `<ul class="footer-legal-links">${footerLegalLinks
                          .map(
                              (l) =>
                                  `<li><a class="footer-legal-link" href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a></li>`
                          )
                          .join('')}</ul>`
                    : ''
            }
        </div>`
                : '';

        const footerPromoLinks = `<div class="footer-links">${footerAnchors}</div>`;
        const footerBodyInner = useCustomFooter
            ? `${footerDirectoryHtml}${footerLead}${footerLegalBlock}`
            : `${footerLead}${footerPromoLinks}`;

        return `<!DOCTYPE html>
<html lang="${safeLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(docTitle)}</title>${headExtraBlock}
    <style>
        * { box-sizing: border-box; }

        html {
            scrollbar-gutter: stable;
        }

        :root {
            --bg: #f4f4f5;
            --surface: #ffffff;
            --text: #18181b;
            --muted: #71717a;
            --border: rgba(24, 24, 27, 0.12);
            --accent: #3b2e8c;
            --accent-hover: #2d2269;
            --shadow: 0 1px 3px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.04);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg: #09090b;
                --surface: #18181b;
                --text: #fafafa;
                --muted: #a1a1aa;
                --border: rgba(250, 250, 250, 0.12);
                --accent: #8b7ce8;
                --accent-hover: #a89df0;
                --shadow: 0 1px 3px rgba(0,0,0,.4), 0 12px 40px rgba(0,0,0,.35);
            }
        }

        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }

        .page-wrap {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }

        .page-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: stretch;
            min-height: 0;
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
        }

        .site-header {
            flex-shrink: 0;
            border-bottom: 1px solid var(--border);
            background: color-mix(in srgb, var(--surface) 90%, transparent);
            backdrop-filter: blur(10px);
        }

        .site-header-inner {
            max-width: 61.25rem;
            margin: 0 auto;
            padding: 0 1.375rem;
            min-height: 2.75rem;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
            column-gap: 1rem;
        }

        .nav-brand {
            grid-column: 1;
            justify-self: start;
            font-weight: 600;
            font-size: 0.8125rem;
            color: var(--text);
            text-decoration: none;
            letter-spacing: -0.01em;
        }

        .nav-brand:hover {
            color: var(--accent);
        }

        .site-nav {
            grid-column: 2;
            display: flex;
            flex-wrap: nowrap;
            gap: 0 1.75rem;
            align-items: center;
            justify-content: center;
            min-width: 0;
        }

        .nav-utilities {
            grid-column: 3;
            justify-self: end;
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            gap: 0 1.5rem;
            min-width: 0;
        }

        .nav-utility {
            font-size: 0.75rem;
            font-weight: 400;
            color: var(--muted);
            text-decoration: none;
            letter-spacing: -0.01em;
            white-space: nowrap;
        }

        .nav-utility:hover {
            color: var(--text);
        }

        .nav-utility.is-active {
            color: var(--text);
            font-weight: 400;
        }

        .nav-link {
            font-size: 0.75rem;
            font-weight: 400;
            color: var(--muted);
            text-decoration: none;
            padding: 0;
            border-radius: 0;
            border: none;
            letter-spacing: -0.01em;
            white-space: nowrap;
        }

        .nav-link:hover {
            color: var(--text);
            background: transparent;
        }

        .nav-link.is-active {
            color: var(--text);
            background: transparent;
            font-weight: 400;
            border: none;
        }

        .hero-banner {
            position: relative;
            width: 100%;
            overflow: hidden;
            border-bottom: 1px solid var(--border);
        }

        .hero-banner__backdrop {
            position: absolute;
            inset: 0;
            background:
                radial-gradient(80% 120% at 0% 0%, color-mix(in srgb, var(--accent) 26%, transparent), transparent 55%),
                radial-gradient(55% 90% at 100% 15%, color-mix(in srgb, #c026d3 16%, transparent), transparent 50%),
                linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, var(--bg)) 0%, var(--bg) 100%);
            pointer-events: none;
        }

        @media (prefers-color-scheme: dark) {
            .hero-banner__backdrop {
                background:
                    radial-gradient(80% 120% at 0% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 55%),
                    radial-gradient(55% 90% at 100% 15%, rgba(192, 38, 211, 0.12), transparent 50%),
                    linear-gradient(180deg, color-mix(in srgb, var(--surface) 40%, var(--bg)) 0%, var(--bg) 100%);
            }
        }

        .hero-banner__inner {
            position: relative;
            z-index: 1;
            max-width: 56rem;
            margin: 0 auto;
            padding: clamp(3rem, 10vw, 5.25rem) clamp(1.5rem, 4vw, 2rem) clamp(2.5rem, 7vw, 4rem);
        }

        .hero-banner__content {
            max-width: 42rem;
        }

        .hero-banner .brand {
            margin-bottom: 1.35rem;
        }

        .hero-title {
            margin: 0 0 1rem;
            font-size: clamp(2.35rem, 6.5vw, 3.45rem);
            font-weight: 800;
            letter-spacing: -0.04em;
            line-height: 1.06;
            color: var(--text);
        }

        .hero-lead {
            margin: 0;
            font-size: clamp(1.02rem, 2.4vw, 1.1875rem);
            color: var(--muted);
            line-height: 1.68;
            max-width: 38rem;
        }

        .hero-actions {
            margin-top: 2rem;
        }

        .hero-actions .ibatani {
            min-height: 3rem;
            padding: 0 1.5rem;
            font-size: 1rem;
        }

        .site-body-wrap {
            width: 100%;
            max-width: 56rem;
            margin: 0 auto;
            padding: 0 clamp(1.25rem, 4vw, 2rem) 2.5rem;
        }

        .site-body {
            width: 100%;
            display: flex;
            flex-direction: column;
            margin-top: 0.5rem;
        }

        .body-section {
            border-top: 1px solid var(--border);
            padding-top: 1.75rem;
            margin-top: 2rem;
        }

        .body-section-title {
            font-size: 1.2rem;
            font-weight: 650;
            margin: 0 0 0.65rem;
            letter-spacing: -0.02em;
            color: var(--text);
        }

        .body-section-lead {
            margin: 0;
            font-size: 0.95rem;
            color: var(--muted);
            line-height: 1.65;
            max-width: 40rem;
        }

        .body-section-actions {
            margin-top: 1.2rem;
        }

        .brand {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .brand-mark {
            width: 2.25rem;
            height: 2.25rem;
            border-radius: 0.5rem;
            background: linear-gradient(135deg, var(--accent) 0%, #c026d3 100%);
            box-shadow: 0 2px 8px rgba(59, 46, 140, 0.35);
        }

        .brand-name {
            font-weight: 700;
            font-size: 0.95rem;
            letter-spacing: -0.02em;
            color: var(--text);
        }

        .page-title {
            margin: 0 0 0.85rem;
            font-size: clamp(2rem, 5vw, 2.75rem);
            font-weight: 700;
            letter-spacing: -0.035em;
            line-height: 1.15;
            color: var(--text);
        }

        .page-lead {
            margin: 0;
            font-size: 1.0625rem;
            color: var(--muted);
            max-width: 36rem;
            line-height: 1.65;
        }

        .page-lead code {
            font-size: 0.875em;
        }

        code {
            font-family: ui-monospace, "Cascadia Code", "SF Mono", Monaco, Consolas, monospace;
            background: color-mix(in srgb, var(--text) 6%, transparent);
            padding: 0.15em 0.4em;
            border-radius: 0.35rem;
            font-weight: 500;
        }

        .button-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.65rem;
            margin-top: 1.75rem;
        }

        .ibatani {
            border-radius: 9999px;
            border: 1px solid transparent;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 2.75rem;
            padding: 0 1.15rem;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
            background: var(--accent);
            color: #fff;
        }

        .ibatani:hover {
            background: var(--accent-hover);
        }

        .ibatani:active {
            transform: scale(0.98);
        }

        .ibatani.secondary {
            background: transparent;
            color: var(--text);
            border-color: var(--border);
        }

        .ibatani.secondary:hover {
            background: color-mix(in srgb, var(--text) 6%, transparent);
        }

        .site-footer {
            flex-shrink: 0;
            margin-top: auto;
            border-top: 1px solid var(--border);
            background: color-mix(in srgb, var(--surface) 75%, var(--bg));
            padding: 1.25rem clamp(1.25rem, 4vw, 2rem) 1.75rem;
        }

        .site-footer-inner {
            max-width: 56rem;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            text-align: center;
        }

        .footer-tagline {
            margin: 0;
            font-size: 0.8125rem;
            color: var(--muted);
            line-height: 1.5;
            max-width: 42rem;
        }

        .footer-links {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem 1.5rem;
            align-items: center;
            justify-content: center;
        }

        .footer-link {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.875rem;
            color: var(--muted);
            text-decoration: none;
        }

        .footer-link:hover {
            color: var(--text);
            text-decoration: underline;
            text-underline-offset: 3px;
        }

        .footer-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }

        .site-footer-inner--directory {
            align-items: stretch;
            text-align: left;
            gap: 2rem;
            max-width: 61.25rem;
        }

        .footer-directory {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
            gap: 1.75rem 2rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border);
        }

        .footer-col-title {
            margin: 0 0 0.65rem;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text);
            letter-spacing: -0.01em;
        }

        .footer-col-list {
            margin: 0;
            padding: 0;
            list-style: none;
        }

        .footer-col-list li + li {
            margin-top: 0.45rem;
        }

        .footer-col-link {
            font-size: 0.75rem;
            color: var(--muted);
            text-decoration: none;
        }

        .footer-col-link:hover {
            color: var(--text);
            text-decoration: underline;
            text-underline-offset: 2px;
        }

        .footer-legal {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem 1.5rem;
            padding-top: 0.25rem;
        }

        .footer-legal-copy {
            margin: 0;
            font-size: 0.6875rem;
            color: var(--muted);
            line-height: 1.4;
            max-width: 36rem;
        }

        .footer-legal-links {
            display: flex;
            flex-wrap: wrap;
            gap: 0.35rem 1rem;
            margin: 0;
            padding: 0;
            list-style: none;
        }

        .footer-legal-link {
            font-size: 0.6875rem;
            color: var(--muted);
            text-decoration: none;
        }

        .footer-legal-link:hover {
            color: var(--text);
            text-decoration: underline;
            text-underline-offset: 2px;
        }

        ${allStyles}
    </style>
</head>
<body class="antialiased">
${navBlock}
<div class="page-wrap">
    <main class="page-main">
        <section class="hero-banner" aria-labelledby="page-heading">
            <div class="hero-banner__backdrop" aria-hidden="true"></div>
            <div class="hero-banner__inner">
                <div class="hero-banner__content">
            ${
                showInnerBrand
                    ? `<div class="brand" aria-hidden="true">
                <span class="brand-mark"></span>
                <span class="brand-name">${escapeHtml(brandName)}</span>
            </div>`
                    : ''
            }
            <h1 id="page-heading" class="hero-title">${escapeHtml(headline)}</h1>
            ${leadHtml ? leadHtml.replace('class="page-lead"', 'class="page-lead hero-lead"') : ''}
            <div class="button-container hero-actions">${buttonHtml}</div>
                </div>
            </div>
        </section>
        ${
            bodySectionsHtml
                ? `<div class="site-body-wrap"><div class="site-body" role="region" aria-label="Page sections">${bodySectionsHtml}</div></div>`
                : ''
        }
        ${
            partialsHtml
                ? `<div class="site-body-wrap bemba-ingisa-root" role="region" aria-label="Imported partials">${partialsHtml}</div>`
                : ''
        }
    </main>
    <footer class="site-footer">
        <div class="site-footer-inner${useCustomFooter ? ' site-footer-inner--directory' : ''}">
            ${footerBodyInner}
        </div>
    </footer>
</div>
    <script>
        // BembaJS runtime functions
        function londolola(message) {
            alert(message);
        }
        
        function pangaIpepa(title, content) {
            console.log('Page:', title, content);
        }
        
        function fyambaIcipanda(name, props) {
            console.log('Component:', name, props);
        }
        function pangaIcapaba(props) {
            console.log('Partial:', props);
        }
    </script>${siteScriptBlock}
</body>
</html>`;
    }
    
    extractAppName(code) {
        const match = code.match(/pangaWebusaiti\s*\(\s*["']([^"']+)["']/);
        return match ? match[1] : 'BembaJS App';
    }
    
    extractSections(code) {
        // Simple approach - just look for the basic structure
        const sections = [];
        
        // Extract title and content
        const titleMatch = code.match(/umutwe:\s*["']([^"']*)["']/);
        const contentMatch = code.match(/ilyashi:\s*["']([^"']*)["']/);
        
        const section = {
            umutwe: titleMatch ? titleMatch[1] : 'Welcome',
            ilyashi: contentMatch ? contentMatch[1] : 'Hello from BembaJS!',
            amabatani: []
        };
        
        // Extract buttons - use a more robust approach
        // Look for button patterns in the entire code
        const buttonPattern = /ilembo:\s*["']([^"']*)["'][\s\S]*?pakuKlikisha:\s*["']([^"']*)["']/g;
        let buttonMatch;
        
        while ((buttonMatch = buttonPattern.exec(code)) !== null) {
            const ilembo = buttonMatch[1];
            let pakuKlikisha = buttonMatch[2];
            
            // If pakuKlikisha is incomplete, try to find the complete function call
            if (pakuKlikisha.endsWith('(')) {
                // Find the position of this button in the code
                const buttonStart = buttonMatch.index;
                const pakuKlikishaStart = code.indexOf('pakuKlikisha:', buttonStart);
                
                if (pakuKlikishaStart !== -1) {
                    // Find the opening quote after pakuKlikisha:
                    const quoteStart = code.indexOf('"', pakuKlikishaStart);
                    if (quoteStart !== -1) {
                        // Find the matching closing quote by counting parentheses
                        let quoteEnd = quoteStart + 1;
                        let parenCount = 0;
                        let inString = true;
                        
                        while (quoteEnd < code.length && inString) {
                            const char = code[quoteEnd];
                            if (char === '(') parenCount++;
                            else if (char === ')') parenCount--;
                            else if (char === '"' && code[quoteEnd - 1] !== '\\' && parenCount === 0) {
                                inString = false;
                            }
                            quoteEnd++;
                        }
                        
                        if (!inString) {
                            pakuKlikisha = code.substring(quoteStart + 1, quoteEnd - 1);
                        }
                    }
                }
            }
            
            section.amabatani.push({
                ilembo: ilembo,
                pakuKlikisha: pakuKlikisha
            });
        }
        
        // If no buttons found, add a default one
        if (section.amabatani.length === 0) {
            section.amabatani.push({
                ilembo: 'Click Me!',
                pakuKlikisha: 'londolola("Hello from BembaJS!")'
            });
        }
        
        sections.push(section);
        return sections;
    }
    
    extractValue(text, key) {
        const regex = new RegExp(`${key}:\\s*["']([^"']*)["']`);
        const match = text.match(regex);
        return match ? match[1] : null;
    }
    
    extractStyles(code) {
        const styleMatch = code.match(/imikalile:\s*`([\s\S]*?)`/);
        return styleMatch ? styleMatch[1] : `
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .icipandwa { 
                background: white; 
                padding: 30px; 
                margin: 20px auto; 
                border-radius: 10px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                max-width: 600px;
                text-align: center;
            }
            h2 { 
                color: #667eea; 
                font-size: 2em; 
                margin-bottom: 15px;
            }
            p { 
                color: #555; 
                font-size: 1.1em; 
                line-height: 1.6;
                margin-bottom: 20px;
            }
            .button-container {
                margin-top: 20px;
            }
            .ibatani { 
                background: #667eea; 
                color: white; 
                padding: 12px 30px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                font-size: 16px;
                margin: 5px;
                transition: all 0.3s;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .ibatani:hover { 
                background: #764ba2; 
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0,0,0,0.2);
            }
        `;
    }
}

module.exports = BembaParser;