// Lexer/Tokenizer for BembaJS syntax
const { BEMBA_SYNTAX } = require('./constants');

class BembaLexer {
    constructor() {
        this.tokens = [];
        this.current = 0;
        this.source = '';
        this.line = 1;
        this.column = 1;
        
        // Token types
        this.TOKEN_TYPES = {
            // Keywords
            COMPONENT_DEF: 'COMPONENT_DEF',
            PAGE_DEF: 'PAGE_DEF',
            PROPS: 'PROPS',
            STATE: 'STATE',
            CONSTRUCTOR: 'CONSTRUCTOR',
            RENDER: 'RENDER',
            DATA_FETCHING: 'DATA_FETCHING',
            RETURN: 'RETURN',
            FUNCTION: 'FUNCTION',
            ASYNC: 'ASYNC',
            AWAIT: 'AWAIT',
            THIS: 'THIS',
            
            // Hooks
            HOOK_USE_STATE: 'HOOK_USE_STATE',
            HOOK_USE_EFFECT: 'HOOK_USE_EFFECT',
            HOOK_USE_CONTEXT: 'HOOK_USE_CONTEXT',
            HOOK_USE_REF: 'HOOK_USE_REF',
            HOOK_USE_REDUCER: 'HOOK_USE_REDUCER',
            HOOK_USE_MEMO: 'HOOK_USE_MEMO',
            HOOK_USE_CALLBACK: 'HOOK_USE_CALLBACK',
            
            // Routing
            NAVIGATE: 'NAVIGATE',
            GO_BACK: 'GO_BACK',
            ROUTE: 'ROUTE',
            PARAMS: 'PARAMS',
            QUERY: 'QUERY',
            
            // Literals
            STRING: 'STRING',
            NUMBER: 'NUMBER',
            BOOLEAN: 'BOOLEAN',
            IDENTIFIER: 'IDENTIFIER',
            
            // Operators
            ASSIGN: 'ASSIGN',
            EQUALS: 'EQUALS',
            NOT_EQUALS: 'NOT_EQUALS',
            LESS_THAN: 'LESS_THAN',
            GREATER_THAN: 'GREATER_THAN',
            PLUS: 'PLUS',
            MINUS: 'MINUS',
            MULTIPLY: 'MULTIPLY',
            DIVIDE: 'DIVIDE',
            MODULO: 'MODULO',
            
            // Punctuation
            LEFT_PAREN: 'LEFT_PAREN',
            RIGHT_PAREN: 'RIGHT_PAREN',
            LEFT_BRACE: 'LEFT_BRACE',
            RIGHT_BRACE: 'RIGHT_BRACE',
            LEFT_BRACKET: 'LEFT_BRACKET',
            RIGHT_BRACKET: 'RIGHT_BRACKET',
            SEMICOLON: 'SEMICOLON',
            COMMA: 'COMMA',
            DOT: 'DOT',
            COLON: 'COLON',
            QUESTION: 'QUESTION',
            
            // JSX
            JSX_OPEN: 'JSX_OPEN',
            JSX_CLOSE: 'JSX_CLOSE',
            JSX_SELF_CLOSE: 'JSX_SELF_CLOSE',
            JSX_EXPRESSION: 'JSX_EXPRESSION',
            
            // Special
            NEWLINE: 'NEWLINE',
            WHITESPACE: 'WHITESPACE',
            COMMENT: 'COMMENT',
            EOF: 'EOF'
        };
        
        // Bemba keyword mappings
        this.keywords = {
            [BEMBA_SYNTAX.COMPONENT_DEF]: this.TOKEN_TYPES.COMPONENT_DEF,
            [BEMBA_SYNTAX.PAGE_DEF]: this.TOKEN_TYPES.PAGE_DEF,
            [BEMBA_SYNTAX.PROPS]: this.TOKEN_TYPES.PROPS,
            [BEMBA_SYNTAX.STATE]: this.TOKEN_TYPES.STATE,
            [BEMBA_SYNTAX.CONSTRUCTOR]: this.TOKEN_TYPES.CONSTRUCTOR,
            [BEMBA_SYNTAX.RENDER]: this.TOKEN_TYPES.RENDER,
            [BEMBA_SYNTAX.DATA_FETCHING]: this.TOKEN_TYPES.DATA_FETCHING,
            [BEMBA_SYNTAX.RETURN]: this.TOKEN_TYPES.RETURN,
            [BEMBA_SYNTAX.FUNCTION]: this.TOKEN_TYPES.FUNCTION,
            [BEMBA_SYNTAX.ASYNC]: this.TOKEN_TYPES.ASYNC,
            [BEMBA_SYNTAX.AWAIT]: this.TOKEN_TYPES.AWAIT,
            [BEMBA_SYNTAX.THIS]: this.TOKEN_TYPES.THIS,
            
            // Hooks
            [BEMBA_SYNTAX.HOOKS.useState]: this.TOKEN_TYPES.HOOK_USE_STATE,
            [BEMBA_SYNTAX.HOOKS.useEffect]: this.TOKEN_TYPES.HOOK_USE_EFFECT,
            [BEMBA_SYNTAX.HOOKS.useContext]: this.TOKEN_TYPES.HOOK_USE_CONTEXT,
            [BEMBA_SYNTAX.HOOKS.useRef]: this.TOKEN_TYPES.HOOK_USE_REF,
            [BEMBA_SYNTAX.HOOKS.useReducer]: this.TOKEN_TYPES.HOOK_USE_REDUCER,
            [BEMBA_SYNTAX.HOOKS.useMemo]: this.TOKEN_TYPES.HOOK_USE_MEMO,
            [BEMBA_SYNTAX.HOOKS.useCallback]: this.TOKEN_TYPES.HOOK_USE_CALLBACK,
            
            // Routing
            [BEMBA_SYNTAX.ROUTING.navigate]: this.TOKEN_TYPES.NAVIGATE,
            [BEMBA_SYNTAX.ROUTING.goBack]: this.TOKEN_TYPES.GO_BACK,
            [BEMBA_SYNTAX.ROUTING.route]: this.TOKEN_TYPES.ROUTE,
            [BEMBA_SYNTAX.ROUTING.params]: this.TOKEN_TYPES.PARAMS,
            [BEMBA_SYNTAX.ROUTING.query]: this.TOKEN_TYPES.QUERY,
            
            // Boolean literals
            'ee': this.TOKEN_TYPES.BOOLEAN,
            'ukukana': this.TOKEN_TYPES.BOOLEAN,
            'takuli': this.TOKEN_TYPES.BOOLEAN,
            'ukukanaba': this.TOKEN_TYPES.BOOLEAN
        };
    }
    
    tokenize(source) {
        this.source = source;
        this.tokens = [];
        this.current = 0;
        this.line = 1;
        this.column = 1;
        
        while (!this.isAtEnd()) {
            this.scanToken();
        }
        
        this.addToken(this.TOKEN_TYPES.EOF, null);
        return this.tokens;
    }
    
    scanToken() {
        const char = this.advance();
        
        switch (char) {
            case '(':
                this.addToken(this.TOKEN_TYPES.LEFT_PAREN);
                break;
            case ')':
                this.addToken(this.TOKEN_TYPES.RIGHT_PAREN);
                break;
            case '{':
                this.addToken(this.TOKEN_TYPES.LEFT_BRACE);
                break;
            case '}':
                this.addToken(this.TOKEN_TYPES.RIGHT_BRACE);
                break;
            case '[':
                this.addToken(this.TOKEN_TYPES.LEFT_BRACKET);
                break;
            case ']':
                this.addToken(this.TOKEN_TYPES.RIGHT_BRACKET);
                break;
            case ',':
                this.addToken(this.TOKEN_TYPES.COMMA);
                break;
            case '.':
                this.addToken(this.TOKEN_TYPES.DOT);
                break;
            case ';':
                this.addToken(this.TOKEN_TYPES.SEMICOLON);
                break;
            case ':':
                this.addToken(this.TOKEN_TYPES.COLON);
                break;
            case '?':
                this.addToken(this.TOKEN_TYPES.QUESTION);
                break;
            case '+':
                this.addToken(this.TOKEN_TYPES.PLUS);
                break;
            case '-':
                this.addToken(this.TOKEN_TYPES.MINUS);
                break;
            case '*':
                this.addToken(this.TOKEN_TYPES.MULTIPLY);
                break;
            case '/':
                if (this.match('/')) {
                    // Line comment
                    while (this.peek() !== '\n' && !this.isAtEnd()) {
                        this.advance();
                    }
                } else if (this.match('*')) {
                    // Block comment
                    while (!this.isAtEnd()) {
                        if (this.peek() === '*' && this.peekNext() === '/') {
                            this.advance();
                            this.advance();
                            break;
                        }
                        this.advance();
                    }
                } else {
                    this.addToken(this.TOKEN_TYPES.DIVIDE);
                }
                break;
            case '%':
                this.addToken(this.TOKEN_TYPES.MODULO);
                break;
            case '=':
                this.addToken(this.match('=') ? this.TOKEN_TYPES.EQUALS : this.TOKEN_TYPES.ASSIGN);
                break;
            case '!':
                this.addToken(this.match('=') ? this.TOKEN_TYPES.NOT_EQUALS : 'BANG');
                break;
            case '<':
                if (this.match('=')) {
                    this.addToken('LESS_EQUAL');
                } else if (this.match('/')) {
                    // JSX closing tag
                    this.addToken(this.TOKEN_TYPES.JSX_CLOSE);
                } else {
                    this.addToken(this.TOKEN_TYPES.LESS_THAN);
                }
                break;
            case '>':
                if (this.match('=')) {
                    this.addToken('GREATER_EQUAL');
                } else {
                    this.addToken(this.TOKEN_TYPES.GREATER_THAN);
                }
                break;
            case '"':
            case "'":
                this.string(char);
                break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace
                break;
            case '\n':
                this.line++;
                this.column = 1;
                this.addToken(this.TOKEN_TYPES.NEWLINE);
                break;
            default:
                if (this.isDigit(char)) {
                    this.number();
                } else if (this.isAlpha(char)) {
                    this.identifier();
                } else {
                    throw new Error(`Unexpected character: ${char} at line ${this.line}, column ${this.column}`);
                }
                break;
        }
    }
    
    string(quote) {
        let value = '';
        
        while (this.peek() !== quote && !this.isAtEnd()) {
            if (this.peek() === '\n') {
                this.line++;
                this.column = 1;
            }
            value += this.advance();
        }
        
        if (this.isAtEnd()) {
            throw new Error('Unterminated string');
        }
        
        this.advance(); // consume closing quote
        this.addToken(this.TOKEN_TYPES.STRING, value);
    }
    
    number() {
        let value = '';
        
        while (this.isDigit(this.peek())) {
            value += this.advance();
        }
        
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            value += this.advance(); // consume '.'
            while (this.isDigit(this.peek())) {
                value += this.advance();
            }
        }
        
        this.addToken(this.TOKEN_TYPES.NUMBER, parseFloat(value));
    }
    
    identifier() {
        let value = '';
        
        while (this.isAlphaNumeric(this.peek())) {
            value += this.advance();
        }
        
        const tokenType = this.keywords[value] || this.TOKEN_TYPES.IDENTIFIER;
        this.addToken(tokenType, value);
    }
    
    addToken(type, literal = null) {
        const token = {
            type,
            literal,
            lexeme: this.source.substring(this.current - (literal ? literal.toString().length : 1), this.current),
            line: this.line,
            column: this.column
        };
        this.tokens.push(token);
    }
    
    advance() {
        this.column++;
        return this.source[this.current++];
    }
    
    match(expected) {
        if (this.isAtEnd()) return false;
        if (this.source[this.current] !== expected) return false;
        
        this.current++;
        this.column++;
        return true;
    }
    
    peek() {
        if (this.isAtEnd()) return '\0';
        return this.source[this.current];
    }
    
    peekNext() {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source[this.current + 1];
    }
    
    isAlpha(char) {
        return (char >= 'a' && char <= 'z') ||
               (char >= 'A' && char <= 'Z') ||
               char === '_';
    }
    
    isDigit(char) {
        return char >= '0' && char <= '9';
    }
    
    isAlphaNumeric(char) {
        return this.isAlpha(char) || this.isDigit(char);
    }
    
    isAtEnd() {
        return this.current >= this.source.length;
    }
}

module.exports = BembaLexer;
