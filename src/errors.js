// Bemba Error Messages - Error translations in Bemba language
const BEMBA_ERRORS = {
    // Syntax errors (Ifipushi fya syntax)
    SYNTAX: {
        UNEXPECTED_TOKEN: 'Ifipushi fya syntax: Token yakufwile kuba na',
        MISSING_SEMICOLON: 'Ifipushi fya syntax: Semicolon yakufwile kuba na',
        MISSING_BRACKET: 'Ifipushi fya syntax: Bracket yakufwile kuba na',
        MISSING_PARENTHESIS: 'Ifipushi fya syntax: Parenthesis yakufwile kuba na',
        INVALID_IDENTIFIER: 'Ifipushi fya syntax: Identifier yakufwile kuba na',
        DUPLICATE_DECLARATION: 'Ifipushi fya syntax: Declaration yakufwile kuba na',
        INVALID_EXPRESSION: 'Ifipushi fya syntax: Expression yakufwile kuba na'
    },
    
    // Runtime errors (Ifipushi fya kutantika)
    RUNTIME: {
        UNDEFINED_VARIABLE: 'Ifipushi fya kutantika: Variable yakufwile kuba na',
        TYPE_ERROR: 'Ifipushi fya kutantika: Type yakufwile kuba na',
        REFERENCE_ERROR: 'Ifipushi fya kutantika: Reference yakufwile kuba na',
        RANGE_ERROR: 'Ifipushi fya kutantika: Range yakufwile kuba na',
        NETWORK_ERROR: 'Ifipushi fya kutantika: Network yakufwile kuba na',
        TIMEOUT_ERROR: 'Ifipushi fya kutantika: Timeout yakufwile kuba na'
    },
    
    // Validation errors (Ifipushi fya kupepesha)
    VALIDATION: {
        REQUIRED_PROP: 'Ifipushi fya kupepesha: Prop yakufwile kuba na',
        INVALID_PROP_TYPE: 'Ifipushi fya kupepesha: Prop type yakufwile kuba na',
        MISSING_REQUIRED_FIELD: 'Ifipushi fya kupepesha: Required field yakufwile kuba na',
        INVALID_FORMAT: 'Ifipushi fya kupepesha: Format yakufwile kuba na',
        OUT_OF_RANGE: 'Ifipushi fya kupepesha: Range yakufwile kuba na',
        DUPLICATE_VALUE: 'Ifipushi fya kupepesha: Duplicate value yakufwile kuba na'
    },
    
    // Component errors (Ifipushi fya components)
    COMPONENT: {
        MISSING_COMPONENT_NAME: 'Ifipushi fya component: Component name yakufwile kuba na',
        INVALID_COMPONENT_STRUCTURE: 'Ifipushi fya component: Component structure yakufwile kuba na',
        MISSING_RENDER_METHOD: 'Ifipushi fya component: Render method yakufwile kuba na',
        INVALID_STATE_UPDATE: 'Ifipushi fya component: State update yakufwile kuba na',
        CIRCULAR_DEPENDENCY: 'Ifipushi fya component: Circular dependency yakufwile kuba na'
    },
    
    // API errors (Ifipushi fya API)
    API: {
        INVALID_ENDPOINT: 'Ifipushi fya API: Endpoint yakufwile kuba na',
        MISSING_METHOD: 'Ifipushi fya API: Method yakufwile kuba na',
        INVALID_REQUEST_BODY: 'Ifipushi fya API: Request body yakufwile kuba na',
        UNAUTHORIZED: 'Ifipushi fya API: Unauthorized yakufwile kuba na',
        FORBIDDEN: 'Ifipushi fya API: Forbidden yakufwile kuba na',
        NOT_FOUND: 'Ifipushi fya API: Not found yakufwile kuba na',
        SERVER_ERROR: 'Ifipushi fya API: Server error yakufwile kuba na'
    },
    
    // File system errors (Ifipushi fya files)
    FILE_SYSTEM: {
        FILE_NOT_FOUND: 'Ifipushi fya files: File yakufwile kuba na',
        PERMISSION_DENIED: 'Ifipushi fya files: Permission denied yakufwile kuba na',
        DIRECTORY_NOT_FOUND: 'Ifipushi fya files: Directory yakufwile kuba na',
        INVALID_FILE_FORMAT: 'Ifipushi fya files: File format yakufwile kuba na',
        FILE_TOO_LARGE: 'Ifipushi fya files: File too large yakufwile kuba na'
    }
};

// Error message formatter
class BembaErrorFormatter {
    constructor() {
        this.errors = BEMBA_ERRORS;
    }
    
    // Format error with context
    formatError(errorType, category, context = {}) {
        const errorTemplate = this.errors[category]?.[errorType];
        if (!errorTemplate) {
            return `Ifipushi: ${errorType} yakufwile kuba na`;
        }
        
        // Add context information
        let message = errorTemplate;
        if (context.file) {
            message += ` (File: ${context.file})`;
        }
        if (context.line) {
            message += ` (Line: ${context.line})`;
        }
        if (context.column) {
            message += ` (Column: ${context.column})`;
        }
        if (context.suggestion) {
            message += `\nSuggestion: ${context.suggestion}`;
        }
        
        return message;
    }
    
    // Create syntax error
    syntaxError(errorType, context = {}) {
        return this.formatError(errorType, 'SYNTAX', context);
    }
    
    // Create runtime error
    runtimeError(errorType, context = {}) {
        return this.formatError(errorType, 'RUNTIME', context);
    }
    
    // Create validation error
    validationError(errorType, context = {}) {
        return this.formatError(errorType, 'VALIDATION', context);
    }
    
    // Create component error
    componentError(errorType, context = {}) {
        return this.formatError(errorType, 'COMPONENT', context);
    }
    
    // Create API error
    apiError(errorType, context = {}) {
        return this.formatError(errorType, 'API', context);
    }
    
    // Create file system error
    fileSystemError(errorType, context = {}) {
        return this.formatError(errorType, 'FILE_SYSTEM', context);
    }
}

// Export error formatter instance
const bembaErrorFormatter = new BembaErrorFormatter();

module.exports = {
    BEMBA_ERRORS,
    BembaErrorFormatter,
    bembaErrorFormatter
};
