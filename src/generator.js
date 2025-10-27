// Code Generator - generates React components from Bemba AST
const { BEMBA_SYNTAX } = require('./constants');

class BembaGenerator {
    constructor() {
        this.indentLevel = 0;
        this.indentSize = 2;
    }
    
    generate(ast) {
        if (Array.isArray(ast)) {
            return ast.map(node => this.generateNode(node)).join('\n');
        }
        
        return this.generateNode(ast);
    }
    
    generateNode(node) {
        if (!node || typeof node !== 'object') {
            return this.generateLiteral(node);
        }
        
        switch (node.type) {
            case 'ReactComponent':
            case 'ReactFunctionalComponent':
                return this.generateReactComponent(node);
            case 'NextJSPage':
                return this.generateNextJSPage(node);
            case 'ReactPage':
                return this.generateReactPage(node);
            case 'ApiHandler':
                return this.generateApiHandler(node);
            case 'ReactHook':
                return this.generateReactHook(node);
            case 'JSXElement':
                return this.generateJSXElement(node);
            case 'JSXReturn':
                return this.generateJSXReturn(node);
            case 'FunctionCall':
                return this.generateFunctionCall(node);
            case 'StateUpdate':
                return this.generateStateUpdate(node);
            case 'Expression':
                return this.generateExpression(node);
            case 'Import':
                return this.generateImport(node);
            case 'Export':
                return this.generateExport(node);
            case 'Program':
                return this.generateProgram(node);
            case 'Module':
                return this.generateModule(node);
            default:
                return this.generateGenericNode(node);
        }
    }
    
    // React Component generation
    generateReactComponent(node) {
        const imports = this.generateReactImports();
        const stateDeclarations = this.generateStateDeclarations(node.state, node.stateWithEffects);
        const hooks = node.hooks.map(hook => this.generateReactHook(hook)).join('\n');
        const methods = this.generateMethods(node.methods);
        const render = this.generateJSXReturn(node.render);
        
        return `${imports}

${this.generateComponentComment(node.name)}
function ${node.name}({ ${this.generatePropsSignature(node.props)} }) {
${this.increaseIndent()}${stateDeclarations}
${hooks}
${methods}
${this.increaseIndent()}return (
${this.increaseIndent()}${render}
${this.decreaseIndent()});
${this.decreaseIndent()}}

export default ${node.name};`;
    }
    
    generateReactImports() {
        return `import React${this.generateHookImports()} from 'react';`;
    }
    
    generateHookImports() {
        const hooks = ['useState', 'useEffect', 'useContext', 'useRef', 'useReducer', 'useMemo', 'useCallback'];
        return hooks.length > 0 ? `, { ${hooks.join(', ')} }` : '';
    }
    
    generateComponentComment(name) {
        return `/**
 * ${name} - Generated from BembaJS
 * This component was automatically generated from Bemba syntax
 */`;
    }
    
    generatePropsSignature(props) {
        if (!props || Object.keys(props).length === 0) {
            return '';
        }
        
        return Object.keys(props).join(', ');
    }
    
    generateStateDeclarations(state, stateWithEffects) {
        const declarations = [];
        
        // Generate regular state declarations
        if (state && Object.keys(state).length > 0) {
            for (const [key, value] of Object.entries(state)) {
                const initialValue = this.generateLiteral(value);
                declarations.push(`const [${key}, set${this.capitalize(key)}] = useState(${initialValue});`);
            }
        }
        
        // Generate state with effects
        if (stateWithEffects && Object.keys(stateWithEffects).length > 0) {
            for (const [key, value] of Object.entries(stateWithEffects)) {
                if (key !== 'effect') {
                    const initialValue = this.generateLiteral(value);
                    declarations.push(`const [${key}, set${this.capitalize(key)}] = useState(${initialValue});`);
                }
            }
            
            // Generate useEffect for side effects
            if (stateWithEffects.effect) {
                const effectCode = this.generateNode(stateWithEffects.effect);
                declarations.push(`useEffect(() => {\n${this.increaseIndent()}${effectCode}\n${this.decreaseIndent()}}, []);`);
            }
        }
        
        return declarations.join('\n');
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // Next.js Page generation
    generateNextJSPage(node) {
        const component = this.generateReactComponent(node.component);
        const getServerSideProps = node.getServerSideProps ? this.generateGetServerSideProps(node.getServerSideProps) : '';
        const getStaticProps = node.getStaticProps ? this.generateGetStaticProps(node.getStaticProps) : '';
        const getStaticPaths = node.getStaticPaths ? this.generateGetStaticPaths(node.getStaticPaths) : '';
        
        return `${component}

${getServerSideProps}
${getStaticProps}
${getStaticPaths}`;
    }
    
    generateGetServerSideProps(handler) {
        return `export async function getServerSideProps(context) {
${this.increaseIndent()}${this.generateNode(handler)}
${this.decreaseIndent()}}`;
    }
    
    generateGetStaticProps(handler) {
        return `export async function getStaticProps(context) {
${this.increaseIndent()}${this.generateNode(handler)}
${this.decreaseIndent()}}`;
    }
    
    generateGetStaticPaths(handler) {
        return `export async function getStaticPaths() {
${this.increaseIndent()}${this.generateNode(handler)}
${this.decreaseIndent()}}`;
    }
    
    // React Hook generation
    generateReactHook(node) {
        const args = node.args.map(arg => this.generateNode(arg)).join(', ');
        return `${this.getIndent()}const [${this.generateHookVariableName(node)}] = ${node.hookType}(${args});`;
    }
    
    generateHookVariableName(node) {
        // Generate appropriate variable names based on hook type
        switch (node.hookType) {
            case 'useState':
                return 'state, setState';
            case 'useEffect':
                return 'effect';
            case 'useRef':
                return 'ref';
            case 'useContext':
                return 'context';
            case 'useReducer':
                return 'state, dispatch';
            case 'useMemo':
                return 'memoizedValue';
            case 'useCallback':
                return 'callback';
            default:
                return 'value';
        }
    }
    
    // JSX generation
    generateJSXElement(node) {
        const tagName = node.tagName;
        const props = this.generateJSXProps(node.props);
        const children = node.children.map(child => this.generateJSXChild(child)).join('');
        
        if (node.isSelfClosing) {
            return `${this.getIndent()}<${tagName}${props} />`;
        }
        
        if (children.trim()) {
            return `${this.getIndent()}<${tagName}${props}>${children}</${tagName}>`;
        } else {
            return `${this.getIndent()}<${tagName}${props}></${tagName}>`;
        }
    }
    
    // Generate JSX child nodes
    generateJSXChild(child) {
        if (!child) return '';
        
        // Handle JSXText nodes
        if (child.type === 'JSXText') {
            return child.text || '';
        }
        
        // Handle JSXExpression nodes
        if (child.type === 'JSXExpression') {
            return `{${this.generateNode(child.expression)}}`;
        }
        
        // Handle JSXElement nodes
        if (child.type === 'JSXElement') {
            return this.generateJSXElement(child);
        }
        
        // Handle string literals
        if (typeof child === 'string') {
            return child;
        }
        
        // Handle other node types
        return this.generateNode(child);
    }
    
    generateJSXProps(props) {
        if (!props || Object.keys(props).length === 0) {
            return '';
        }
        
        const propStrings = Object.entries(props).map(([key, value]) => {
            if (typeof value === 'string') {
                return ` ${key}="${value}"`;
            } else if (typeof value === 'boolean' && value) {
                return ` ${key}`;
            } else {
                return ` ${key}={${this.generateNode(value)}}`;
            }
        });
        
        return propStrings.join('');
    }
    
    generateJSXReturn(node) {
        if (!node || !node.expression) {
            return `${this.getIndent()}<div>Empty component</div>`;
        }
        
        return this.generateNode(node.expression);
    }
    
    // Function call generation
    generateFunctionCall(node) {
        const args = node.args.map(arg => this.generateNode(arg)).join(', ');
        return `${node.name}(${args})`;
    }
    
    // State update generation
    generateStateUpdate(node) {
        const stateName = this.generateNode(node.stateName);
        const newValue = this.generateNode(node.newValue);
        return `set${this.capitalize(stateName)}(${newValue})`;
    }
    
    // Expression generation
    generateExpression(node) {
        if (node.operator === 'ASSIGN') {
            return `${this.generateNode(node.left)} = ${this.generateNode(node.right)}`;
        }
        
        const left = this.generateNode(node.left);
        const right = this.generateNode(node.right);
        
        switch (node.operator) {
            case 'PLUS':
                return `${left} + ${right}`;
            case 'MINUS':
                return `${left} - ${right}`;
            case 'MULTIPLY':
                return `${left} * ${right}`;
            case 'DIVIDE':
                return `${left} / ${right}`;
            case 'EQUALS':
                return `${left} === ${right}`;
            case 'NOT_EQUALS':
                return `${left} !== ${right}`;
            case 'LESS_THAN':
                return `${left} < ${right}`;
            case 'GREATER_THAN':
                return `${left} > ${right}`;
            default:
                return `${left} ${node.operator} ${right}`;
        }
    }
    
    // Import/Export generation
    generateImport(node) {
        if (node.specifiers.length === 0) {
            return `import '${node.source}';`;
        }
        
        const defaultImport = node.specifiers.find(spec => spec.isDefault);
        const namedImports = node.specifiers.filter(spec => !spec.isDefault);
        
        let importString = 'import ';
        
        if (defaultImport) {
            importString += defaultImport.name;
            if (namedImports.length > 0) {
                importString += ', ';
            }
        }
        
        if (namedImports.length > 0) {
            importString += `{ ${namedImports.map(spec => spec.name).join(', ')} }`;
        }
        
        importString += ` from '${node.source}';`;
        
        return importString;
    }
    
    generateExport(node) {
        if (node.isDefault) {
            return `export default ${this.generateNode(node.declaration)};`;
        } else {
            return `export ${this.generateNode(node.declaration)};`;
        }
    }
    
    // Program and Module generation
    generateProgram(node) {
        const imports = node.imports.map(imp => this.generateImport(imp)).join('\n');
        const statements = node.statements.map(stmt => this.generateNode(stmt)).join('\n\n');
        const exports = node.exports.map(exp => this.generateExport(exp)).join('\n');
        
        return [imports, statements, exports].filter(Boolean).join('\n\n');
    }
    
    generateModule(node) {
        return `// Generated from: ${node.filePath}
${this.generateProgram(node.program)}`;
    }
    
    // Method generation
    generateMethods(methods) {
        if (!methods || Object.keys(methods).length === 0) {
            return '';
        }
        
        return Object.entries(methods).map(([name, method]) => {
            return `${this.getIndent()}const ${name} = ${this.generateNode(method)};`;
        }).join('\n');
    }
    
    // Generic node generation
    generateGenericNode(node) {
        if (node.children) {
            return node.children.map(child => this.generateNode(child)).join('\n');
        }
        
        if (node.statements) {
            return node.statements.map(stmt => this.generateNode(stmt)).join('\n');
        }
        
        return JSON.stringify(node, null, 2);
    }
    
    // Literal generation
    generateLiteral(value) {
        if (typeof value === 'string') {
            return `"${value.replace(/"/g, '\\"')}"`;
        }
        
        if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
        }
        
        if (value === null) {
            return 'null';
        }
        
        if (value === undefined) {
            return 'undefined';
        }
        
        return String(value);
    }
    
    // Indentation utilities
    getIndent() {
        return ' '.repeat(this.indentLevel * this.indentSize);
    }
    
    increaseIndent() {
        this.indentLevel++;
        return '';
    }
    
    decreaseIndent() {
        this.indentLevel--;
        return '';
    }
    
    // Generate complete React project structure
    generateProject(transformedProject) {
        const files = new Map();
        
        for (const [filePath, module] of transformedProject.modules) {
            const generatedCode = this.generateModule(module);
            files.set(filePath, generatedCode);
        }
        
        return files;
    }
    
    // Generate package.json for React project
    generatePackageJson(projectName = 'bemba-react-app') {
        return `{
  "name": "${projectName}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "typescript": "^5.0.0"
  }
}`;
    }
    
    // Generate Next.js configuration
    generateNextConfig() {
        return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig`;
    }
}

module.exports = BembaGenerator;