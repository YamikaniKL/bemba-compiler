// AST Transformer - converts Bemba AST to React-compatible structure
const { BEMBA_SYNTAX } = require('./constants');

class BembaTransformer {
    constructor() {
        this.transformers = {
            Component: this.transformComponent.bind(this),
            Page: this.transformPage.bind(this),
            ApiRoute: this.transformApiRoute.bind(this),
            Hook: this.transformHook.bind(this),
            JSXElement: this.transformJSXElement.bind(this),
            FunctionCall: this.transformFunctionCall.bind(this),
            Expression: this.transformExpression.bind(this),
            Import: this.transformImport.bind(this),
            Export: this.transformExport.bind(this)
        };
    }
    
    transform(ast) {
        if (Array.isArray(ast)) {
            return ast.map(node => this.transformNode(node));
        }
        
        return this.transformNode(ast);
    }
    
    transformNode(node) {
        if (!node || typeof node !== 'object') {
            return node;
        }
        
        const transformer = this.transformers[node.type];
        if (transformer) {
            return transformer(node);
        }
        
        // Transform children if they exist
        if (node.children) {
            node.children = node.children.map(child => this.transformNode(child));
        }
        
        if (node.statements) {
            node.statements = node.statements.map(stmt => this.transformNode(stmt));
        }
        
        return node;
    }
    
    // Component transformation
    transformComponent(node) {
        const reactComponent = {
            type: 'ReactComponent',
            name: node.name,
            props: this.transformProps(node.props),
            state: this.transformState(node.state),
            hooks: node.hooks.map(hook => this.transformHook(hook)),
            lifecycle: this.transformLifecycle(node.lifecycle),
            methods: this.transformMethods(node.methods),
            render: this.transformRender(node.lifecycle.render)
        };
        
        return reactComponent;
    }
    
    transformProps(props) {
        if (!props || typeof props !== 'object') {
            return {};
        }
        
        const reactProps = {};
        for (const [key, value] of Object.entries(props)) {
            reactProps[key] = this.transformNode(value);
        }
        
        return reactProps;
    }
    
    transformState(state) {
        if (!state || typeof state !== 'object') {
            return {};
        }
        
        const reactState = {};
        for (const [key, value] of Object.entries(state)) {
            reactState[key] = this.transformNode(value);
        }
        
        return reactState;
    }
    
    transformLifecycle(lifecycle) {
        if (!lifecycle) {
            return {};
        }
        
        const reactLifecycle = {};
        
        // Transform constructor to useEffect with empty dependency array
        if (lifecycle.constructor) {
            reactLifecycle.useEffect = [
                {
                    type: 'useEffect',
                    effect: lifecycle.constructor,
                    deps: []
                }
            ];
        }
        
        // Transform data fetching to getServerSideProps or getStaticProps
        if (lifecycle.dataFetching) {
            reactLifecycle.dataFetching = this.transformDataFetching(lifecycle.dataFetching);
        }
        
        return reactLifecycle;
    }
    
    transformDataFetching(dataFetching) {
        return {
            type: 'DataFetching',
            method: dataFetching.async ? 'getServerSideProps' : 'getStaticProps',
            handler: this.transformNode(dataFetching)
        };
    }
    
    transformMethods(methods) {
        if (!methods || typeof methods !== 'object') {
            return {};
        }
        
        const reactMethods = {};
        for (const [key, value] of Object.entries(methods)) {
            reactMethods[key] = this.transformNode(value);
        }
        
        return reactMethods;
    }
    
    transformRender(render) {
        if (!render) {
            return null;
        }
        
        return {
            type: 'JSXReturn',
            expression: this.transformNode(render)
        };
    }
    
    // Page transformation
    transformPage(node) {
        const reactPage = {
            type: 'ReactPage',
            path: node.path,
            component: this.transformComponent(node.component),
            dataFetching: node.dataFetching ? this.transformDataFetching(node.dataFetching) : null,
            isDynamic: node.isDynamic,
            metadata: node.metadata
        };
        
        return reactPage;
    }
    
    // API Route transformation
    transformApiRoute(node) {
        return {
            type: 'ApiHandler',
            path: node.path,
            method: node.method,
            handler: this.transformNode(node.handler)
        };
    }
    
    // Hook transformation
    transformHook(node) {
        const hookMappings = {
            [BEMBA_SYNTAX.HOOKS.useState]: 'useState',
            [BEMBA_SYNTAX.HOOKS.useEffect]: 'useEffect',
            [BEMBA_SYNTAX.HOOKS.useContext]: 'useContext',
            [BEMBA_SYNTAX.HOOKS.useRef]: 'useRef',
            [BEMBA_SYNTAX.HOOKS.useReducer]: 'useReducer',
            [BEMBA_SYNTAX.HOOKS.useMemo]: 'useMemo',
            [BEMBA_SYNTAX.HOOKS.useCallback]: 'useCallback'
        };
        
        const reactHookType = hookMappings[node.hookType] || node.hookType;
        
        return {
            type: 'ReactHook',
            hookType: reactHookType,
            args: node.args.map(arg => this.transformNode(arg))
        };
    }
    
    // JSX Element transformation
    transformJSXElement(node) {
        const tagMappings = BEMBA_SYNTAX.JSX;
        const reactTagName = tagMappings[node.tagName] || node.tagName;
        
        return {
            type: 'JSXElement',
            tagName: reactTagName,
            props: this.transformJSXProps(node.props),
            children: node.children.map(child => this.transformNode(child)),
            isSelfClosing: node.isSelfClosing
        };
    }
    
    transformJSXProps(props) {
        if (!props || typeof props !== 'object') {
            return {};
        }
        
        const reactProps = {};
        for (const [key, value] of Object.entries(props)) {
            // Transform Bemba event handlers to React event handlers
            if (key.startsWith('paku')) {
                const eventName = key.replace('paku', 'on').toLowerCase();
                reactProps[eventName] = this.transformNode(value);
            } else {
                reactProps[key] = this.transformNode(value);
            }
        }
        
        return reactProps;
    }
    
    // Function call transformation
    transformFunctionCall(node) {
        const functionMappings = {
            [BEMBA_SYNTAX.ROUTING.navigate]: 'router.push',
            [BEMBA_SYNTAX.ROUTING.goBack]: 'router.back',
            [BEMBA_SYNTAX.RETURN]: 'return',
            [BEMBA_SYNTAX.THIS]: 'this'
        };
        
        const reactFunctionName = functionMappings[node.name] || node.name;
        
        return {
            type: 'FunctionCall',
            name: reactFunctionName,
            args: node.args.map(arg => this.transformNode(arg))
        };
    }
    
    // Expression transformation
    transformExpression(node) {
        return {
            type: 'Expression',
            operator: node.operator,
            left: this.transformNode(node.left),
            right: this.transformNode(node.right)
        };
    }
    
    // Import transformation
    transformImport(node) {
        // Transform Bemba imports to React imports
        const transformedSpecifiers = node.specifiers.map(spec => {
            if (spec.name === 'React') {
                return { name: 'React', alias: null };
            }
            return spec;
        });
        
        return {
            type: 'Import',
            source: node.source,
            specifiers: transformedSpecifiers
        };
    }
    
    // Export transformation
    transformExport(node) {
        return {
            type: 'Export',
            declaration: this.transformNode(node.declaration),
            isDefault: node.isDefault
        };
    }
    
    // Utility methods for complex transformations
    transformComponentToReact(component) {
        const hooks = component.hooks.map(hook => this.transformHook(hook));
        const lifecycle = this.transformLifecycle(component.lifecycle);
        
        return {
            type: 'ReactFunctionalComponent',
            name: component.name,
            props: component.props,
            hooks,
            lifecycle,
            methods: component.methods,
            render: component.lifecycle.render
        };
    }
    
    transformPageToNextJS(page) {
        const component = this.transformComponentToReact(page.component);
        
        return {
            type: 'NextJSPage',
            path: page.path,
            component,
            getServerSideProps: page.dataFetching?.method === 'getServerSideProps' ? page.dataFetching.handler : null,
            getStaticProps: page.dataFetching?.method === 'getStaticProps' ? page.dataFetching.handler : null,
            getStaticPaths: page.isDynamic ? this.generateGetStaticPaths(page) : null
        };
    }
    
    generateGetStaticPaths(page) {
        // Generate getStaticPaths for dynamic routes
        if (page.isDynamic) {
            return {
                type: 'FunctionDeclaration',
                name: 'getStaticPaths',
                params: [],
                body: [
                    {
                        type: 'ReturnStatement',
                        value: {
                            type: 'ObjectExpression',
                            properties: {
                                paths: [],
                                fallback: false
                            }
                        }
                    }
                ]
            };
        }
        return null;
    }
    
    // Transform entire project
    transformProject(project) {
        const transformedModules = new Map();
        
        for (const [filePath, module] of project.modules) {
            const transformedModule = {
                ...module,
                program: this.transformNode(module.program)
            };
            
            // Transform components to React components
            if (module.program.statements) {
                transformedModule.program.statements = module.program.statements.map(stmt => {
                    if (stmt.type === 'Component') {
                        return this.transformComponentToReact(stmt);
                    } else if (stmt.type === 'Page') {
                        return this.transformPageToNextJS(stmt);
                    }
                    return this.transformNode(stmt);
                });
            }
            
            transformedModules.set(filePath, transformedModule);
        }
        
        return {
            modules: transformedModules,
            dependencies: project.dependencies,
            imports: project.imports,
            exports: project.exports,
            errors: project.errors
        };
    }
}

module.exports = BembaTransformer;