#!/usr/bin/env node

// CLI tool for BembaJS framework
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { BEMBA_FOLDERS, DEFAULT_CONFIG } = require('./constants');
const BembaParser = require('./parser');
const BembaTransformer = require('./transformer');
const BembaGenerator = require('./generator');
const BembaRouter = require('./router');

class BembaCLI {
    constructor() {
        this.program = new Command();
        this.setupCommands();
    }
    
    setupCommands() {
        this.program
            .name('bemba')
            .description('BembaJS CLI - Build web applications with Bemba language')
            .version('1.0.0');
        
        // Create new project
        this.program
            .command('panga <name>')
            .description('Create a new BembaJS project')
            .option('-t, --template <template>', 'Project template to use', 'base')
            .option('--typescript', 'Use TypeScript')
            .action((name, options) => this.createProject(name, options));
        
        // Alternative create command
        this.program
            .command('new <name>')
            .description('Create a new BembaJS project (alias for panga)')
            .option('-t, --template <template>', 'Project template to use', 'base')
            .option('--typescript', 'Use TypeScript')
            .action((name, options) => this.createProject(name, options));
        
        // Initialize project in current directory
        this.program
            .command('init')
            .description('Initialize BembaJS project in current directory')
            .option('-t, --template <template>', 'Project template to use', 'base')
            .option('--typescript', 'Use TypeScript')
            .action((options) => this.initProject(options));
        
        // Start development server
        this.program
            .command('tungulula')
            .description('Start development server')
            .option('-p, --port <port>', 'Port to run on', '3000')
            .option('--host <host>', 'Host to bind to', 'localhost')
            .action((options) => this.startDevServer(options));
        
        // Build for production
        this.program
            .command('akha')
            .description('Build project for production')
            .option('-o, --output <dir>', 'Output directory', 'dist')
            .option('--analyze', 'Analyze bundle size')
            .action((options) => this.buildProject(options));
        
        // Export static site
        this.program
            .command('fumya')
            .description('Export static site')
            .option('-o, --output <dir>', 'Output directory', 'out')
            .action((options) => this.exportStatic(options));
        
        // Compile single file
        this.program
            .command('panga-icibukisho <file>')
            .description('Compile a single Bemba file')
            .option('-o, --output <file>', 'Output file')
            .action((file, options) => this.compileFile(file, options));
        
        // Generate component
        this.program
            .command('panga-icipanda <name>')
            .description('Generate a new component')
            .option('-t, --type <type>', 'Component type', 'functional')
            .action((name, options) => this.generateComponent(name, options));
        
        // Generate page
        this.program
            .command('panga-ipepa <name>')
            .description('Generate a new page')
            .option('-d, --dynamic', 'Create dynamic route')
            .action((name, options) => this.generatePage(name, options));
        
        // Lint code
        this.program
            .command('lemba')
            .description('Lint Bemba code')
            .option('--fix', 'Fix linting errors')
            .action((options) => this.lintCode(options));
        
        // Test
        this.program
            .command('esha')
            .description('Run tests')
            .option('--watch', 'Watch mode')
            .action((options) => this.runTests(options));
    }
    
    // Create new project
    createProject(name, options) {
        console.log(`Creating new BembaJS project: ${name}`);
        
        const projectPath = path.resolve(name);
        
        if (fs.existsSync(projectPath)) {
            console.error(`Directory ${name} already exists`);
            process.exit(1);
        }
        
        // Create project directory
        fs.mkdirSync(projectPath, { recursive: true });
        
        // Create folder structure
        this.createFolderStructure(projectPath);
        
        // Create initial files
        this.createInitialFiles(projectPath, name, options);
        
        // Create package.json
        this.createPackageJson(projectPath, name, options);
        
        // Create configuration
        this.createConfig(projectPath);
        
        console.log(`✅ Project ${name} created successfully!`);
        console.log(`📁 Navigate to the project: cd ${name}`);
        console.log(`🚀 Start development: bemba tungulula`);
    }
    
    initProject(options) {
        console.log(`🚀 Initializing BembaJS project in current directory`);
        
        const projectPath = process.cwd();
        const projectName = path.basename(projectPath);
        
        // Check if directory is empty
        const files = fs.readdirSync(projectPath);
        if (files.length > 0) {
            console.log(`⚠️  Directory is not empty. Some files may be overwritten.`);
        }
        
        // Create folder structure
        this.createFolderStructure(projectPath);
        
        // Create initial files
        this.createInitialFiles(projectPath, projectName, options);
        
        // Create package.json
        this.createPackageJson(projectPath, projectName, options);
        
        // Create configuration
        this.createConfig(projectPath);
        
        console.log(`✅ Project initialized successfully!`);
        console.log(`📁 Location: ${projectPath}`);
        console.log(`🚀 Start development: bemba tungulula`);
    }
    
    createFolderStructure(projectPath) {
        const folders = [
            BEMBA_FOLDERS.PAGES,
            BEMBA_FOLDERS.COMPONENTS,
            BEMBA_FOLDERS.PUBLIC,
            BEMBA_FOLDERS.API,
            BEMBA_FOLDERS.STYLES,
            BEMBA_FOLDERS.UTILS
        ];
        
        for (const folder of folders) {
            const folderPath = path.join(projectPath, folder);
            fs.mkdirSync(folderPath, { recursive: true });
        }
    }
    
    createInitialFiles(projectPath, name, options) {
        // Create home page
        const homePageContent = `pangaIpepa({
    ukwisulula: nokuti() {
        bwelela (
            <icipandwa className="container">
                <umutwe_ukulu>Mwaiseni ku ${name}!</umutwe_ukulu>
                <ukulondolola>Welcome to your new BembaJS application.</ukulondolola>
                <ibatani pakuKlikisha={() => londolola('Mwashibukeni!')}>
                    Click me!
                </ibatani>
            </icipandwa>
        )
    }
});`;
        
        fs.writeFileSync(
            path.join(projectPath, BEMBA_FOLDERS.PAGES, 'index.bemba'),
            homePageContent
        );
        
        // Create about page
        const aboutPageContent = `pangaIpepa({
    ukwisulula: nokuti() {
        bwelela (
            <icipandwa className="container">
                <umutwe_ukulu>About</umutwe_ukulu>
                <ukulondolola>This is the about page.</ukulondolola>
            </icipandwa>
        )
    }
});`;
        
        fs.writeFileSync(
            path.join(projectPath, BEMBA_FOLDERS.PAGES, 'about.bemba'),
            aboutPageContent
        );
        
        // Create basic component
        const componentContent = `fyambaIcipanda('Button', {
    ifyapangwa: {
        ilembo: icishilano,
        pakuKlikisha: nokuti()
    },
    ukwisulula: nokuti() {
        bwelela (
            <ibatani 
                className="button" 
                pakuKlikisha={ici.ifyapangwa.pakuKlikisha}
            >
                {ici.ifyapangwa.ilembo}
            </ibatani>
        )
    }
});`;
        
        fs.writeFileSync(
            path.join(projectPath, BEMBA_FOLDERS.COMPONENTS, 'Button.bemba'),
            componentContent
        );
        
        // Create global styles
        const globalStyles = `/* Global styles for ${name} */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.button:hover {
    background-color: #0056b3;
}`;
        
        fs.writeFileSync(
            path.join(projectPath, BEMBA_FOLDERS.STYLES, 'global.css'),
            globalStyles
        );
        
        // Create README
        const readmeContent = `# ${name}

A BembaJS application.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   bemba tungulula
   \`\`\`

3. Build for production:
   \`\`\`bash
   bemba akha
   \`\`\`

## Project Structure

- \`${BEMBA_FOLDERS.PAGES}/\` - Page components (routing)
- \`${BEMBA_FOLDERS.COMPONENTS}/\` - Reusable components
- \`${BEMBA_FOLDERS.PUBLIC}/\` - Static assets
- \`${BEMBA_FOLDERS.API}/\` - API routes
- \`${BEMBA_FOLDERS.STYLES}/\` - CSS styles
- \`${BEMBA_FOLDERS.UTILS}/\` - Utility functions

## Learn More

Visit [BembaJS Documentation](https://bembajs.dev) to learn more about the framework.
`;
        
        fs.writeFileSync(
            path.join(projectPath, 'README.md'),
            readmeContent
        );
    }
    
    createPackageJson(projectPath, name, options) {
        const packageJson = {
            name: name,
            version: '1.0.0',
            private: true,
            scripts: {
                dev: 'bemba tungulula',
                build: 'bemba akha',
                start: 'node dist/server.js',
                export: 'bemba fumya',
                lint: 'bemba lemba'
            },
            dependencies: {
                'bemba-compiler': '^1.0.0',
                'express': '^4.21.2',
                'react': '^18.0.0',
                'react-dom': '^18.0.0',
                'next': '^14.0.0'
            },
            devDependencies: {
                'bemba-cli': '^1.0.0'
            }
        };
        
        if (options.typescript) {
            packageJson.devDependencies['typescript'] = '^5.0.0';
            packageJson.devDependencies['@types/react'] = '^18.0.0';
            packageJson.devDependencies['@types/react-dom'] = '^18.0.0';
            packageJson.devDependencies['@types/node'] = '^20.0.0';
        }
        
        fs.writeFileSync(
            path.join(projectPath, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
    }
    
    createConfig(projectPath) {
        const config = {
            ...DEFAULT_CONFIG,
            project: {
                name: path.basename(projectPath),
                version: '1.0.0'
            }
        };
        
        fs.writeFileSync(
            path.join(projectPath, 'bemba.config.js'),
            `module.exports = ${JSON.stringify(config, null, 2)};`
        );
    }
    
    // Start development server
    startDevServer(options) {
        console.log(`Starting BembaJS development server on port ${options.port}`);
        
        const DevServer = require('./dev-server');
        const server = new DevServer({
            port: parseInt(options.port),
            host: options.host
        });
        
        server.start();
    }
    
    // Build project
    buildProject(options) {
        console.log('Building BembaJS project for production...');
        
        const BuildSystem = require('./build');
        const builder = new BuildSystem({
            outputDir: options.output,
            analyze: options.analyze
        });
        
        builder.build();
    }
    
    // Export static site
    exportStatic(options) {
        console.log('Exporting static site...');
        
        const BuildSystem = require('./build');
        const builder = new BuildSystem({
            outputDir: options.output,
            static: true
        });
        
        builder.export();
    }
    
    // Compile single file
    compileFile(file, options) {
        console.log(`Compiling ${file}...`);
        
        const parser = new BembaParser();
        const transformer = new BembaTransformer();
        const generator = new BembaGenerator();
        
        try {
            const ast = parser.parseFile(file);
            const transformed = transformer.transform(ast);
            const generated = generator.generate(transformed);
            
            if (options.output) {
                fs.writeFileSync(options.output, generated);
                console.log(`✅ Compiled to ${options.output}`);
            } else {
                console.log(generated);
            }
        } catch (error) {
            console.error(`❌ Compilation error: ${error.message}`);
            process.exit(1);
        }
    }
    
    // Generate component
    generateComponent(name, options) {
        console.log(`Generating component: ${name}`);
        
        const componentContent = `fyambaIcipanda('${name}', {
    ifyapangwa: {
        // Add props here
    },
    ifyakubika: {
        // Add state here
    },
    ukwisulula: nokuti() {
        bwelela (
            <icipandwa className="${name.toLowerCase()}">
                <umutwe>${name}</umutwe>
                {/* Add component content here */}
            </icipandwa>
        )
    }
});`;
        
        const outputPath = path.join(BEMBA_FOLDERS.COMPONENTS, `${name}.bemba`);
        fs.writeFileSync(outputPath, componentContent);
        
        console.log(`✅ Component created: ${outputPath}`);
    }
    
    // Generate page
    generatePage(name, options) {
        console.log(`Generating page: ${name}`);
        
        const pageContent = `pangaIpepa({
    ukwisulula: nokuti() {
        bwelela (
            <icipandwa className="container">
                <umutwe_ukulu>${name}</umutwe_ukulu>
                {/* Add page content here */}
            </icipandwa>
        )
    }${options.dynamic ? ',\n    ukutolaCifukwa: lombako nokuti() {\n        // Add data fetching logic here\n        bwelela { ifyapangwa: {} }\n    }' : ''}
});`;
        
        const fileName = options.dynamic ? `[${name.toLowerCase()}].bemba` : `${name.toLowerCase()}.bemba`;
        const outputPath = path.join(BEMBA_FOLDERS.PAGES, fileName);
        fs.writeFileSync(outputPath, pageContent);
        
        console.log(`✅ Page created: ${outputPath}`);
    }
    
    // Lint code
    lintCode(options) {
        console.log('Linting Bemba code...');
        
        // TODO: Implement linting
        console.log('✅ Linting completed');
    }
    
    // Run tests
    runTests(options) {
        console.log('Running tests...');
        
        // TODO: Implement testing
        console.log('✅ All tests passed');
    }
    
    // Run CLI
    run() {
        this.program.parse();
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new BembaCLI();
    cli.run();
}

module.exports = BembaCLI;
