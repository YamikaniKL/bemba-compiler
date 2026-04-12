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
            case 'IfStatement':
            case 'ConditionalExpression':
                return this.generateIfStatement(node);
            case 'ForStatement':
            case 'CallExpression':
                if (node.callee && node.callee.property && node.callee.property.name === 'map') {
                    return this.generateForStatement(node);
                }
                return this.generateFunctionCall(node);
            case 'WhileStatement':
                return this.generateWhileStatement(node);
            case 'TryStatement':
                return this.generateTryStatement(node);
            case 'AwaitExpression':
                return this.generateAwaitExpression(node);
            case 'FunctionDeclaration':
                return this.generateFunctionDeclaration(node);
            default:
                return this.generateGenericNode(node);
        }
    }
    
    // React Component generation
    generateReactComponent(node) {
        const imports = this.generateReactImports();
        const hooks = node.hooks.map(hook => this.generateReactHook(hook)).join('\n');
        const methods = this.generateMethods(node.methods);
        const render = this.generateJSXReturn(node.render);
        
        return `${imports}

${this.generateComponentComment(node.name)}
function ${node.name}({ ${this.generatePropsSignature(node.props)} }) {
${this.increaseIndent()}${hooks}
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
    
    // Generate HTML from BembaJS page configuration
    generateHTMLFromPage(pageConfig) {
        const title = pageConfig.umutwe || 'BembaJS App';
        const description = pageConfig.ilyashi || 'Yapangwa na BembaJS';
        const sections = pageConfig.ifiputulwa || [];
        const styles = pageConfig.imikalile || '';
        
        // Generate main content
        let mainContent = '';
        if (sections.length > 0) {
            const section = sections[0]; // Use first section
            mainContent = `
        <main class="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <img alt="BembaJS logo" width="180" height="38" src="/bemba-logo.svg" class="dark:invert" style="color:transparent">
            <ol class="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                <li class="mb-2 tracking-[-.01em]">Tantika ukupanga ukulemba <code class="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">amapeji/index.bemba</code>.</li>
                <li class="tracking-[-.01em]">Bika na ukumona ifyakusendeka mwangu.</li>
            </ol>
            <div class="flex gap-4 items-center flex-col sm:flex-row">
                ${this.generateButtons(section.amabatani || [])}
            </div>
        </main>`;
        }
        
        // Generate footer
        const footer = `
        <footer class="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
            <a class="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://bembajs.dev/learn" target="_blank" rel="noopener noreferrer">
                <svg aria-hidden="true" alt="File icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8.177 14.323l2.896-2.896a1.5 1.5 0 000-2.122L8.177 6.409a1.5 1.5 0 00-2.122 0L3.159 9.305a1.5 1.5 0 000 2.122l2.896 2.896a1.5 1.5 0 002.122 0z"/>
                </svg>
                Funda
            </a>
            <a class="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://bembajs.dev/examples" target="_blank" rel="noopener noreferrer">
                <svg aria-hidden="true" alt="Window icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M0 0h16v16H0V0zm1 1v14h14V1H1z"/>
                </svg>
                Ifyabukaya
            </a>
            <a class="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://bembajs.dev" target="_blank" rel="noopener noreferrer">
                <svg aria-hidden="true" alt="Globe icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
                </svg>
                Ya ku bembajs.dev →
            </a>
        </footer>`;
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <style>
        ${styles}
    </style>
</head>
<body class="antialiased">
    <div class="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        ${mainContent}
        ${footer}
    </div>
</body>
</html>`;
    }
    
    generateButtons(buttons) {
        if (!buttons || buttons.length === 0) return '';
        
        return buttons.map((button, index) => {
            const isSecondary = index > 0;
            const buttonClass = isSecondary 
                ? 'rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]'
                : 'rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-black text-white gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto';
            
            return `<a class="${buttonClass}" href="#" onclick="${button.pakuKlikisha || 'return false;'}" target="_blank" rel="noopener noreferrer">${button.ilembo}</a>`;
        }).join('\n                ');
    }
    
    // Control flow generation
    generateIfStatement(node) {
        if (node.type === 'ConditionalExpression') {
            // Ternary operator for JSX
            return `(${this.generateNode(node.test)} ? ${this.generateNode(node.consequent)} : ${this.generateNode(node.alternate)})`;
        }
        
        // Regular if statement
        let code = `if (${this.generateNode(node.test)}) {\n${this.increaseIndent()}`;
        code += Array.isArray(node.consequent) 
            ? node.consequent.map(stmt => this.generateNode(stmt)).join('\n')
            : this.generateNode(node.consequent);
        code += `\n${this.decreaseIndent()}}`;
        
        if (node.alternate) {
            code += ` else {\n${this.increaseIndent()}`;
            code += Array.isArray(node.alternate)
                ? node.alternate.map(stmt => this.generateNode(stmt)).join('\n')
                : this.generateNode(node.alternate);
            code += `\n${this.decreaseIndent()}}`;
        }
        
        return code;
    }
    
    generateForStatement(node) {
        // Transform to .map() for React
        const array = this.generateNode(node.callee.object);
        const param = node.arguments[0].params[0].name;
        const body = this.generateNode(node.arguments[0].body);
        
        return `${array}.map((${param}) => ${body})`;
    }
    
    generateWhileStatement(node) {
        let code = `while (${this.generateNode(node.test)}) {\n${this.increaseIndent()}`;
        code += Array.isArray(node.body.body)
            ? node.body.body.map(stmt => this.generateNode(stmt)).join('\n')
            : this.generateNode(node.body);
        code += `\n${this.decreaseIndent()}}`;
        return code;
    }
    
    generateTryStatement(node) {
        let code = `try {\n${this.increaseIndent()}`;
        code += Array.isArray(node.block.body)
            ? node.block.body.map(stmt => this.generateNode(stmt)).join('\n')
            : this.generateNode(node.block);
        code += `\n${this.decreaseIndent()}}`;
        
        if (node.handler) {
            code += ` catch (${node.handler.param.name}) {\n${this.increaseIndent()}`;
            code += Array.isArray(node.handler.body.body)
                ? node.handler.body.body.map(stmt => this.generateNode(stmt)).join('\n')
                : this.generateNode(node.handler.body);
            code += `\n${this.decreaseIndent()}}`;
        }
        
        if (node.finalizer) {
            code += ` finally {\n${this.increaseIndent()}`;
            code += Array.isArray(node.finalizer.body)
                ? node.finalizer.body.map(stmt => this.generateNode(stmt)).join('\n')
                : this.generateNode(node.finalizer);
            code += `\n${this.decreaseIndent()}}`;
        }
        
        return code;
    }
    
    generateAwaitExpression(node) {
        return `await ${this.generateNode(node.argument)}`;
    }
    
    generateFunctionDeclaration(node) {
        const asyncKeyword = node.async ? 'async ' : '';
        let code = `${asyncKeyword}function ${node.id.name}(`;
        code += node.params.map(p => p.name).join(', ');
        code += `) {\n${this.increaseIndent()}`;
        code += Array.isArray(node.body.body)
            ? node.body.body.map(stmt => this.generateNode(stmt)).join('\n')
            : this.generateNode(node.body);
        code += `\n${this.decreaseIndent()}}`;
        return code;
    }
}

module.exports = BembaGenerator;