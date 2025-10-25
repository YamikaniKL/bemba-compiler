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
        if (this.check(BEMBA_SYNTAX.COMPONENT_DEF)) {
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
            body
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
    <style>${styles}</style>
</head>
<body>`;
        
        sections.forEach(section => {
            html += `
    <div class="icipandwa">
        <h2>${section.umutwe || 'Section'}</h2>
        <p>${section.ilyashi || ''}</p>`;
            
            if (section.amabatani && section.amabatani.length > 0) {
                html += `
        <div class="button-container">`;
                section.amabatani.forEach(button => {
                    const onClick = button.pakuKlikisha || 'londolola("Button clicked!")';
                    html += `
            <button class="ibatani" onclick="${onClick}">${button.ilembo || 'Button'}</button>`;
                });
                html += `
        </div>`;
            }
            
            html += `
    </div>`;
        });
        
        html += `
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
        // For new syntax, use the full compilation pipeline
        const tokens = this.lexer.tokenize(code);
        const ast = this.parse(tokens);
        // Note: This would need the transformer and generator
        // For now, return a simple message
        return `<!-- New syntax compilation would go here -->`;
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