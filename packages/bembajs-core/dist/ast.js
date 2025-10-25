// AST Node definitions for BembaJS framework

class ASTNode {
    constructor(type, value = null, children = []) {
        this.type = type;
        this.value = value;
        this.children = children;
        this.metadata = {};
    }
}

// Component-related AST nodes
class ComponentNode extends ASTNode {
    constructor(name, props = {}, state = {}, methods = {}) {
        super('Component');
        this.name = name;
        this.props = props;
        this.state = state;
        this.methods = methods;
        this.hooks = [];
        this.lifecycle = {};
    }
}

class PageNode extends ASTNode {
    constructor(path, component, dataFetching = null) {
        super('Page');
        this.path = path;
        this.component = component;
        this.dataFetching = dataFetching;
        this.isDynamic = path.includes('[') && path.includes(']');
        this.isApi = false;
    }
}

class ApiRouteNode extends ASTNode {
    constructor(path, method, handler) {
        super('ApiRoute');
        this.path = path;
        this.method = method;
        this.handler = handler;
    }
}

// Expression and statement nodes
class ExpressionNode extends ASTNode {
    constructor(operator, left, right) {
        super('Expression');
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class FunctionCallNode extends ASTNode {
    constructor(name, args = []) {
        super('FunctionCall');
        this.name = name;
        this.args = args;
    }
}

class VariableNode extends ASTNode {
    constructor(name, value = null, isConst = false) {
        super('Variable');
        this.name = name;
        this.value = value;
        this.isConst = isConst;
    }
}

// Hook nodes
class HookNode extends ASTNode {
    constructor(hookType, args = []) {
        super('Hook');
        this.hookType = hookType;
        this.args = args;
    }
}

// JSX-related nodes
class JSXElementNode extends ASTNode {
    constructor(tagName, props = {}, children = []) {
        super('JSXElement');
        this.tagName = tagName;
        this.props = props;
        this.children = children;
        this.isSelfClosing = false;
    }
}

class JSXTextNode extends ASTNode {
    constructor(text) {
        super('JSXText');
        this.text = text;
    }
}

class JSXExpressionNode extends ASTNode {
    constructor(expression) {
        super('JSXExpression');
        this.expression = expression;
    }
}

// Import/Export nodes
class ImportNode extends ASTNode {
    constructor(source, specifiers = []) {
        super('Import');
        this.source = source;
        this.specifiers = specifiers;
    }
}

class ExportNode extends ASTNode {
    constructor(declaration, isDefault = false) {
        super('Export');
        this.declaration = declaration;
        this.isDefault = isDefault;
    }
}

// Program and module nodes
class ProgramNode extends ASTNode {
    constructor(statements = []) {
        super('Program');
        this.statements = statements;
        this.imports = [];
        this.exports = [];
    }
}

class ModuleNode extends ASTNode {
    constructor(filePath, program) {
        super('Module');
        this.filePath = filePath;
        this.program = program;
        this.dependencies = [];
        this.exports = [];
    }
}

// Routing nodes
class RouteNode extends ASTNode {
    constructor(path, component, middleware = []) {
        super('Route');
        this.path = path;
        this.component = component;
        this.middleware = middleware;
        this.isDynamic = path.includes(':');
        this.isCatchAll = path.includes('*');
    }
}

class RouterNode extends ASTNode {
    constructor(routes = []) {
        super('Router');
        this.routes = routes;
        this.basePath = '/';
        this.middleware = [];
    }
}

// Utility functions for AST manipulation
const ASTUtils = {
    // Find nodes by type
    findNodesByType(ast, type) {
        const results = [];
        
        function traverse(node) {
            if (node.type === type) {
                results.push(node);
            }
            if (node.children) {
                node.children.forEach(traverse);
            }
        }
        
        traverse(ast);
        return results;
    },
    
    // Get all component names from AST
    getComponentNames(ast) {
        const components = this.findNodesByType(ast, 'Component');
        return components.map(comp => comp.name);
    },
    
    // Get all hook calls from AST
    getHookCalls(ast) {
        const hooks = this.findNodesByType(ast, 'Hook');
        return hooks.map(hook => ({
            type: hook.hookType,
            args: hook.args
        }));
    },
    
    // Validate AST structure
    validateAST(ast) {
        const errors = [];
        
        function validateNode(node, path = '') {
            if (!node || typeof node !== 'object') {
                errors.push(`Invalid node at ${path}`);
                return;
            }
            
            if (!node.type) {
                errors.push(`Missing type at ${path}`);
            }
            
            if (node.children && !Array.isArray(node.children)) {
                errors.push(`Children must be array at ${path}`);
            }
            
            if (node.children) {
                node.children.forEach((child, index) => {
                    validateNode(child, `${path}.children[${index}]`);
                });
            }
        }
        
        validateNode(ast);
        return errors;
    }
};

module.exports = {
    ASTNode,
    ComponentNode,
    PageNode,
    ApiRouteNode,
    ExpressionNode,
    FunctionCallNode,
    VariableNode,
    HookNode,
    JSXElementNode,
    JSXTextNode,
    JSXExpressionNode,
    ImportNode,
    ExportNode,
    ProgramNode,
    ModuleNode,
    RouteNode,
    RouterNode,
    ASTUtils
};
