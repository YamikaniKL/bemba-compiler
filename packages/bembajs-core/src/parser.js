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
const { BEMBA_SYNTAX, BEMBA_FOLDERS } = require('./constants');
const fs = require('fs');
const path = require('path');

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
        
        const program = new ProgramNode();
        
        while (!this.isAtEnd()) {
            const statement = this.parseStatement();
            if (statement) {
                program.body.push(statement);
            }
        }
        
        return program;
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
        
        while (!this.isAtEnd()) {
            const statement = this.parseStatement();
            if (statement) {
                statements.push(statement);
            }
        }
        
        return new ProgramNode(statements);
    }
    
    parseStatement() {
        if (this.check(BEMBA_SYNTAX.IF)) {
            return this.parseIfStatement();
        } else if (this.check(BEMBA_SYNTAX.FOR)) {
            return this.parseForStatement();
        } else if (this.check(BEMBA_SYNTAX.WHILE)) {
            return this.parseWhileStatement();
        } else if (this.check(BEMBA_SYNTAX.TRY)) {
            return this.parseTryStatement();
        } else if (this.check(BEMBA_SYNTAX.COMPONENT_DEF)) {
            return this.parseComponent();
        } else if (this.check(BEMBA_SYNTAX.PAGE_DEF)) {
            return this.parsePage();
        } else if (this.check('import')) {
            return this.parseImport();
        } else if (this.check('export')) {
            return this.parseExport();
        } else if (this.check('let') || this.check('const') || this.check('var')) {
            return this.parseVariableDeclaration();
        } else if (this.check(BEMBA_SYNTAX.FUNCTION)) {
            return this.parseFunctionDeclaration();
        } else {
            return this.parseExpression();
        }
    }
    
    // Component parsing
    parseComponent() {
        this.advance(); // consume 'fyambaIcipanda'
        
        // Parse component name
        const name = this.consume('IDENTIFIER', 'Expected component name').literal;
        
        // Parse opening parenthesis
        this.consume('LEFT_PAREN', 'Expected ( after component name');
        
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
        
        // Parse page configuration
        const config = this.parseObject();
        
        // Parse closing parenthesis
        this.consume('RIGHT_PAREN', 'Expected ) after page config');
        
        // Parse semicolon if present
        if (this.check('SEMICOLON')) {
            this.advance();
        }
        
        const page = new PageNode('', null);
        
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
                const key = this.parseExpression();
                this.consume('COLON', 'Expected : after property key');
                const value = this.parseExpression();
                
                if (key.type === 'STRING' || key.type === 'IDENTIFIER') {
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
        
        if (this.check(BEMBA_SYNTAX.AWAIT)) {
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
        if (this.match('FALSE')) return { type: 'BOOLEAN', value: false };
        if (this.match('TRUE')) return { type: 'BOOLEAN', value: true };
        if (this.match('NUMBER', 'STRING')) return this.previous();
        if (this.match('IDENTIFIER')) return this.previous();
        
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
        this.advance(); // consume 'import'
        
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
        
        this.consume('from', 'Expected from after import');
        source = this.consume('STRING', 'Expected import source').literal;
        
        return new ImportNode(source, specifiers);
    }
    
    parseExport() {
        this.advance(); // consume 'export'
        
        const isDefault = this.match('default');
        const declaration = this.parseStatement();
        
        return new ExportNode(declaration, isDefault);
    }
    
    // Variable declaration parsing
    parseVariableDeclaration() {
        const kind = this.previous().type;
        const name = this.consume('IDENTIFIER', 'Expected variable name').literal;
        
        let initializer = null;
        if (this.match('ASSIGN')) {
            initializer = this.parseExpression();
        }
        
        return new VariableNode(name, initializer, kind === 'const');
    }
    
    // Function declaration parsing
    parseFunctionDeclaration() {
        const isAsync = this.check(BEMBA_SYNTAX.ASYNC);
        if (isAsync) {
            this.advance(); // consume 'lombako'
        }
        
        this.advance(); // consume 'nokuti'
        
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
        this.advance(); // consume 'leka'
        const argument = this.parseExpression();
        return {
            type: 'AwaitExpression',
            argument
        };
    }
    
    parseBlock() {
        const statements = [];
        
        while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
            statements.push(this.parseStatement());
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
        
        if (this.check(BEMBA_SYNTAX.ELSE)) {
            this.advance(); // consume 'kapena'
            if (this.check(BEMBA_SYNTAX.IF)) {
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
        this.consume(BEMBA_SYNTAX.IN, 'Expected mu');
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
        
        if (this.check(BEMBA_SYNTAX.CATCH)) {
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
        
        if (this.check(BEMBA_SYNTAX.FINALLY)) {
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
    
    // Backward compatibility method for old syntax
    compile(code) {
        try {
            // Simple compilation for pangaWebusaiti syntax
            if (code.includes('pangaWebusaiti')) {
                return this.compileOldSyntax(code);
            } else {
                // For new syntax, use the full pipeline
                return this.compileNewSyntax(code);
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
                <button class="${buttonClass}" onclick="${onClick}">${button.ilembo || 'Button'}</button>`;
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
    
    compileNewSyntax(code) {
        // Extract page configuration from pangaIpepa syntax
        const appName = this.extractAppNameFromNewSyntax(code);
        const sections = this.extractSectionsFromNewSyntax(code);
        const styles = this.extractStylesFromNewSyntax(code);
        
        // Generate the same modern layout as compileOldSyntax
        return this.generateModernLayout(appName, sections, styles);
    }
    
    extractAppNameFromNewSyntax(code) {
        const match = code.match(/pangaIpepa\s*\(\s*["']([^"']+)["']/);
        return match ? match[1] : 'BembaJS App';
    }
    
    extractSectionsFromNewSyntax(code) {
        const sections = [];
        
        // Extract title and content from pangaIpepa
        const titleMatch = code.match(/umutwe:\s*["']([^"']*)["']/);
        const descMatch = code.match(/ilyashi:\s*["']([^"']*)["']/);
        
        if (titleMatch || descMatch) {
            sections.push({
                title: titleMatch ? titleMatch[1] : 'Get started by editing',
                content: descMatch ? descMatch[1] : 'Save and see your changes instantly.',
                buttons: this.extractButtonsFromNewSyntax(code)
            });
        }
        
        return sections;
    }
    
    extractButtonsFromNewSyntax(code) {
        const buttons = [];
        
        // Look for amabatani array in ifiputulwa
        const buttonMatches = code.match(/amabatani:\s*\[([\s\S]*?)\]/);
        if (buttonMatches) {
            const buttonContent = buttonMatches[1];
            const buttonRegex = /\{\s*ilembo:\s*["']([^"']+)["']\s*,\s*pakuKlikisha:\s*["']([^"']+)["']\s*\}/g;
            let match;
            
            while ((match = buttonRegex.exec(buttonContent)) !== null) {
                buttons.push({
                    label: match[1],
                    onClick: match[2]
                });
            }
        }
        
        return buttons;
    }
    
    extractStylesFromNewSyntax(code) {
        const styleMatch = code.match(/imikalile:\s*["']([\s\S]*?)["']/);
        return styleMatch ? styleMatch[1] : '';
    }
    
    generateModernLayout(appName, sections, styles) {
        // Use the same modern layout generation as compileOldSyntax
        const defaultButtons = [
            { label: 'Deploy now', onClick: 'window.open("https://vercel.com/new?utm_source=create-bembajs&utm_medium=appdir-template&utm_campaign=create-bembajs", "_blank")' },
            { label: 'Read our docs', onClick: 'window.open("https://bembajs.dev/docs", "_blank")' }
        ];
        
        const buttons = sections.length > 0 && sections[0].buttons ? sections[0].buttons : defaultButtons;
        
        return `<!DOCTYPE html>
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
            <div class="button-container">
                ${buttons.map((button, index) => `
                    <button class="ibatani ${index === 1 ? 'secondary' : ''}" onclick="${button.onClick}">
                        ${button.label}
                    </button>
                `).join('')}
            </div>
        </main>
        <footer>
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