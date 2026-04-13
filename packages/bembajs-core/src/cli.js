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
const { parseLangFromArgvOnly, normalizeLang, t: msg } = require('./cli-i18n');

const __coreArgvLang = parseLangFromArgvOnly(process.argv);
if (__coreArgvLang !== undefined) {
    process.env.BEMBA_CLI_LANG = __coreArgvLang;
}

class BembaCLI {
    constructor() {
        this.program = new Command();
        this.setupCommands();
    }
    
    setupCommands() {
        const argvLang = parseLangFromArgvOnly(process.argv);
        this.program.name('bemba').description(msg('rootDesc')).version(CORE_VERSION);
        if (argvLang !== undefined) {
            this.program.option('-l, --lang <lang>', msg('optLang'), argvLang);
        } else {
            this.program.option('-l, --lang <lang>', msg('optLang'));
        }

        this.program.hook('preAction', (thisCommand) => {
            const root = thisCommand.root();
            const opts = root.opts();
            if (opts && opts.lang != null && String(opts.lang).trim() !== '') {
                process.env.BEMBA_CLI_LANG = normalizeLang(opts.lang);
            }
        });
        
        // Create new project
        this.program
            .command('panga <name>')
            .description(msg('pangaDesc'))
            .option('-t, --template <template>', msg('optTemplate'), 'base')
            .option('--typescript', msg('optTypescript'))
            .action((name, options) => this.createProject(name, options));
        
        // Alternative create command
        this.program
            .command('new <name>')
            .description(msg('newDesc'))
            .option('-t, --template <template>', msg('optTemplate'), 'base')
            .option('--typescript', msg('optTypescript'))
            .action((name, options) => this.createProject(name, options));
        
        // Initialize project in current directory
        this.program
            .command('init')
            .description(msg('initDesc'))
            .option('-t, --template <template>', msg('optTemplate'), 'base')
            .option('--typescript', msg('optTypescript'))
            .action((options) => this.initProject(options));
        
        const templateCmd = this.program.command('template').description(msg('templateDesc'));
        templateCmd
            .command('sync')
            .description(msg('templateSyncDesc'))
            .option('-t, --template <template>', msg('optTemplateSync'))
            .option('--starter', msg('optStarter'))
            .action((options) => this.syncTemplateFromPackage(options));

        // Single-token alias (some runners / older help expect one subcommand)
        this.program
            .command('sync-template')
            .description(msg('syncTemplateDesc'))
            .option('-t, --template <template>', msg('optTemplateSync'))
            .option('--starter', msg('optStarter'))
            .action((options) => this.syncTemplateFromPackage(options));

        // Start development server
        this.program
            .command('tungulula')
            .description(msg('tungululaDesc'))
            .option('-p, --port <port>', msg('optPort'), '3000')
            .option('--host <host>', msg('optHost'), 'localhost')
            .action((options) => this.startDevServer(options));
        
        // Build for production
        this.program
            .command('akha')
            .description(msg('akhaDesc'))
            .option('-o, --output <dir>', msg('optOutput'), 'dist')
            .option('--base-url <url>', msg('optBaseUrl'))
            .option('--locale <code>', msg('optLocale'), 'en')
            .option('--site-title <title>', msg('optSiteTitle'))
            .option('--analyze', msg('optAnalyze'))
            .option('--legacy-next', msg('optLegacyNext'))
            .option('--no-bemba-site', msg('optNoBembaSite'))
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
            .description(msg('fumyaDesc'))
            .option('-o, --output <dir>', msg('optOutput'), 'out')
            .option('--base-url <url>', msg('optBaseUrl'))
            .option('--locale <code>', msg('optLocale'), 'en')
            .option('--site-title <title>', msg('optSiteTitle'))
            .option('--no-bemba-site', msg('optNoBembaSite'))
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
            .description(msg('pangaIcibukishoDesc'))
            .option('-o, --output <file>', msg('optOutputFile'))
            .action((file, options) => this.compileFile(file, options));
        
        // Generate component
        this.program
            .command('panga-icipanda <name>')
            .description(msg('pangaIcipandaDesc'))
            .option('-t, --type <type>', msg('optComponentType'), 'functional')
            .action((name, options) => this.generateComponent(name, options));
        
        // Generate page
        this.program
            .command('panga-ipepa <name>')
            .description(msg('pangaIpepaDesc'))
            .option('-d, --dynamic', msg('optDynamic'))
            .action((name, options) => this.generatePage(name, options));
        
        // Lint code
        this.program
            .command('lemba')
            .description(msg('lembaDesc'))
            .option('--fix', msg('optFix'))
            .action((options) => this.lintCode(options));
        
        // Test
        this.program
            .command('esha')
            .description(msg('eshaDesc'))
            .option('--watch', msg('optWatch'))
            .action((options) => this.runTests(options));
    }
    
    // Create new project
    createProject(name, options) {
        console.log(msg('creatingProject', name));
        
        const projectPath = path.resolve(name);
        
        if (fs.existsSync(projectPath)) {
            console.error(msg('dirExists', name));
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
        
        console.log(msg('projectCreated', name));
        console.log(msg('templateLine', options.template || 'base'));
        console.log(msg('cdLine', name));
        console.log(msg('startDevLine'));
    }
    
    initProject(options) {
        console.log(msg('initInCwd'));
        
        const projectPath = process.cwd();
        const projectName = path.basename(projectPath);
        
        // Check if directory is empty
        const files = fs.readdirSync(projectPath);
        if (files.length > 0) {
            console.log(msg('dirNotEmptyWarn'));
        }
        
        // Create folder structure
        this.createFolderStructure(projectPath);
        
        // Create initial files
        this.createInitialFiles(projectPath, projectName, options);
        
        // Create package.json
        this.createPackageJson(projectPath, projectName, options);
        
        // Create configuration
        this.createConfig(projectPath);
        
        console.log(msg('initOk'));
        console.log(msg('templateLine', options.template || 'base'));
        console.log(msg('locationLine', projectPath));
        console.log(msg('startDevLine'));
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
        const templates = require('./cli-project-templates');
        const template = String(options?.template || 'base').toLowerCase();
        if (template !== 'base' && template !== 'ui') {
            throw new Error(`Unknown template "${template}". Use --template base or --template ui`);
        }
        templates.writeProjectTemplateFiles(projectPath, name, { template, scope: 'all' });
    }

    /** Refresh files from the installed package so docs (and optionally starter pages) stay aligned with bembajs-core. */
    syncTemplateFromPackage(options) {
        const templates = require('./cli-project-templates');
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
            const starterPath = path.join(cwd, templates.BEMBA_FOLDERS.COMPONENTS, 'cipanda', 'StarterCard.bemba');
            template = fs.existsSync(starterPath) ? 'ui' : 'base';
        }

        const scope = options.starter ? 'all' : 'docs';
        try {
            templates.writeProjectTemplateFiles(cwd, projectName, { template, scope });
        } catch (e) {
            console.error(e.message || e);
            process.exit(1);
        }

        if (scope === 'docs') {
            console.log(msg('syncDocsOk'));
            console.log(msg('syncDocsTip'));
        } else {
            console.log(msg('syncFull', template));
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
        console.log(msg('startingDevPort', options.port));
        
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
            console.log(msg('buildingLegacy'));
        const BuildSystem = require('./build');
        const builder = new BuildSystem({
            outputDir: options.output,
            analyze: options.analyze
        });
            return builder.build();
        }

        console.log(msg('exportingHtml'));
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
        console.log(msg('exportingSite'));
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
        console.log(msg('compilingFile', file));
        
        const parser = new BembaParser();
        const transformer = new BembaTransformer();
        const generator = new BembaGenerator();
        
        try {
            const ast = parser.parseFile(file);
            const transformed = transformer.transform(ast);
            const generated = generator.generate(transformed);
            
            if (options.output) {
                fs.writeFileSync(options.output, generated);
                console.log(msg('compiledTo', options.output));
            } else {
                console.log(generated);
            }
        } catch (error) {
            console.error(msg('compileErr', error.message));
            process.exit(1);
        }
    }
    
    // Generate component
    generateComponent(name, options) {
        console.log(msg('genComponent', name));
        
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
        
        console.log(msg('componentCreated', outputPath));
    }
    
    // Generate page
    generatePage(name, options) {
        console.log(msg('genPage', name));
        
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
        
        console.log(msg('pageCreated', outputPath));
    }
    
    // Lint code
    lintCode(options) {
        console.log(msg('linting'));
        
        // TODO: Implement linting
        console.log(msg('lintOk'));
    }
    
    // Run tests
    runTests(options) {
        console.log(msg('runningTests'));
        
        // TODO: Implement testing
        console.log(msg('testsOk'));
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
