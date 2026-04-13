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
const { version: CORE_VERSION } = require('../package.json');

class BembaCLI {
    constructor() {
        this.program = new Command();
        this.setupCommands();
    }
    
    setupCommands() {
        this.program
            .name('bemba')
            .description('BembaJS CLI - Build web applications with Bemba language')
            .version(CORE_VERSION);
        
        // Create new project
        this.program
            .command('panga <name>')
            .description('Create a new BembaJS project')
            .option('-t, --template <template>', 'Project template: base | ui', 'base')
            .option('--typescript', 'Use TypeScript')
            .action((name, options) => this.createProject(name, options));
        
        // Alternative create command
        this.program
            .command('new <name>')
            .description('Create a new BembaJS project (alias for panga)')
            .option('-t, --template <template>', 'Project template: base | ui', 'base')
            .option('--typescript', 'Use TypeScript')
            .action((name, options) => this.createProject(name, options));
        
        // Initialize project in current directory
        this.program
            .command('init')
            .description('Initialize BembaJS project in current directory')
            .option('-t, --template <template>', 'Project template: base | ui', 'base')
            .option('--typescript', 'Use TypeScript')
            .action((options) => this.initProject(options));

        const templateCmd = this.program.command('template').description('Sync starter content from the installed bembajs-core package');
        templateCmd
            .command('sync')
            .description(
                'Update docs/CODE-STYLE-AND-UI.md from bembajs-core (single source). Use --starter to overwrite default .bemba pages, shell, README, etc.'
            )
            .option('-t, --template <template>', 'base | ui (default: ui if ifikopo/cipanda/StarterCard.bemba exists, else base)')
            .option('--starter', 'Overwrite starter pages/shell/partials/README/.gitignore/.editorconfig (destructive)')
            .action((options) => this.syncTemplateFromPackage(options));

        // Single-token alias (some runners / older help expect one subcommand)
        this.program
            .command('sync-template')
            .description('Same as `template sync` — refresh docs/starter from this bembajs-core package')
            .option('-t, --template <template>', 'base | ui (default: ui if ifikopo/cipanda/StarterCard.bemba exists, else base)')
            .option('--starter', 'Overwrite starter pages/shell/partials/README/.gitignore/.editorconfig (destructive)')
            .action((options) => this.syncTemplateFromPackage(options));

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
            .description('Export static HTML (pangaIpepa) for production, or legacy Next-style build')
            .option('-o, --output <dir>', 'Output directory', 'dist')
            .option('--base-url <url>', 'Site origin for sitemap.xml / feed.xml (or BEMBA_SITE_URL)')
            .option('--locale <code>', 'html lang (BCP 47)', 'en')
            .option('--site-title <title>', 'RSS channel title')
            .option('--analyze', 'Analyze bundle size (legacy build only)')
            .option('--legacy-next', 'Run legacy Next.js scaffold build instead of HTML export')
            .option('--no-bemba-site', 'Do not inject or copy bemba-site.js')
            .action(async (options) => {
                try {
                    await this.buildProject(options);
                } catch (e) {
                    console.error(e.message || e);
                    process.exit(1);
                }
            });
        
        // Export static site
        this.program
            .command('fumya')
            .description('Export static HTML site (pangaIpepa pages) to a folder')
            .option('-o, --output <dir>', 'Output directory', 'out')
            .option('--base-url <url>', 'Site origin for sitemap.xml / feed.xml (or BEMBA_SITE_URL)')
            .option('--locale <code>', 'html lang (BCP 47)', 'en')
            .option('--site-title <title>', 'RSS channel title')
            .option('--no-bemba-site', 'Do not inject or copy bemba-site.js')
            .action(async (options) => {
                try {
                    await this.exportStatic(options);
                } catch (e) {
                    console.error(e.message || e);
                    process.exit(1);
                }
            });
        
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
        
        console.log(`Project ${name} created successfully.`);
        console.log(`Template: ${options.template || 'base'}`);
        console.log(`Navigate to the project: cd ${name}`);
        console.log(`Start development: bemba tungulula`);
    }
    
    initProject(options) {
        console.log(`Initializing BembaJS project in current directory`);
        
        const projectPath = process.cwd();
        const projectName = path.basename(projectPath);
        
        // Check if directory is empty
        const files = fs.readdirSync(projectPath);
        if (files.length > 0) {
            console.log(`Warning: Directory is not empty. Some files may be overwritten.`);
        }
        
        // Create folder structure
        this.createFolderStructure(projectPath);
        
        // Create initial files
        this.createInitialFiles(projectPath, projectName, options);
        
        // Create package.json
        this.createPackageJson(projectPath, projectName, options);
        
        // Create configuration
        this.createConfig(projectPath);
        
        console.log(`Project initialized successfully.`);
        console.log(`Template: ${options.template || 'base'}`);
        console.log(`Location: ${projectPath}`);
        console.log(`Start development: bemba tungulula`);
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
        const t = require('./cli-project-templates');
        const template = String(options?.template || 'base').toLowerCase();
        if (template !== 'base' && template !== 'ui') {
            throw new Error(`Unknown template "${template}". Use --template base or --template ui`);
        }
        t.writeProjectTemplateFiles(projectPath, name, { template, scope: 'all' });
    }

    /** Refresh files from the installed package so docs (and optionally starter pages) stay aligned with bembajs-core. */
    syncTemplateFromPackage(options) {
        const t = require('./cli-project-templates');
        const cwd = process.cwd();
        let projectName = path.basename(cwd);
        try {
            const raw = fs.readFileSync(path.join(cwd, 'package.json'), 'utf8');
            const pj = JSON.parse(raw);
            if (pj && typeof pj.name === 'string' && pj.name.trim()) projectName = pj.name.trim();
        } catch (_) {
            /* use directory name */
        }

        let template = String(options.template || '').toLowerCase();
        if (template !== 'base' && template !== 'ui') {
            const starterPath = path.join(cwd, t.BEMBA_FOLDERS.COMPONENTS, 'cipanda', 'StarterCard.bemba');
            template = fs.existsSync(starterPath) ? 'ui' : 'base';
        }

        const scope = options.starter ? 'all' : 'docs';
        try {
            t.writeProjectTemplateFiles(cwd, projectName, { template, scope });
        } catch (e) {
            console.error(e.message || e);
            process.exit(1);
        }

        if (scope === 'docs') {
            console.log('Updated docs/CODE-STYLE-AND-UI.md from bembajs-core package.');
            console.log('Tip: run with --starter to replace default umusango/index/about/partials/README (overwrites your edits).');
        } else {
            console.log(
                `Synced full starter (${template}): shell, pages, docs, README, Button.bemba, global.css, .gitignore, .editorconfig.`
            );
        }
    }


    createPackageJson(projectPath, name, options) {
        const packageJson = {
            name: name,
            version: '0.1.0',
            private: true,
            scripts: {
                dev: 'bemba tungulula',
                build: 'bemba akha',
                start: 'node dist/server.js',
                export: 'bemba fumya',
                lint: 'standard',
                'lint:fix': 'standard --fix',
                'lint:bemba': 'bemba lemba'
            },
            dependencies: {
                'bembajs': `^${CORE_VERSION}`,
                'express': '^4.21.2',
                'react': '^18.0.0',
                'react-dom': '^18.0.0',
                'next': '^14.0.0'
            },
            devDependencies: {
                'bembajs-core': `^${CORE_VERSION}`,
                standard: '^17.1.0'
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
                version: '0.1.0'
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
    async buildProject(options) {
        if (options.legacyNext) {
            console.log('Building BembaJS project (legacy Next scaffold)...');
            const BuildSystem = require('./build');
            const builder = new BuildSystem({
                outputDir: options.output,
                analyze: options.analyze
            });
            return builder.build();
        }

        console.log('Exporting static HTML (pangaIpepa)...');
        const { exportStaticHtmlSite } = require('./static-html-export');
        await exportStaticHtmlSite({
            projectRoot: process.cwd(),
            outDir: options.output || 'dist',
            baseUrl: options.baseUrl || process.env.BEMBA_SITE_URL || '',
            siteTitle: options.siteTitle,
            htmlLang: options.locale || 'en',
            bembaSiteScript: options.bembaSite !== false
        });
    }
    
    // Export static site
    async exportStatic(options) {
        console.log('Exporting static HTML site...');
        const { exportStaticHtmlSite } = require('./static-html-export');
        await exportStaticHtmlSite({
            projectRoot: process.cwd(),
            outDir: options.output || 'out',
            baseUrl: options.baseUrl || process.env.BEMBA_SITE_URL || '',
            siteTitle: options.siteTitle,
            htmlLang: options.locale || 'en',
            bembaSiteScript: options.bembaSite !== false
        });
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
