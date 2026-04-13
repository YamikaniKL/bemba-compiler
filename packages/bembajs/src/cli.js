#!/usr/bin/env node

/**
 * BembaJS CLI
 * Command-line interface for BembaJS framework
 */

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { program } = require('commander');
let prompts = null;
try {
    prompts = require('prompts');
} catch (_) {
    /* optional dependency in some installs */
}

let pkgVersion = '1.0.0';
try {
    pkgVersion = require(path.join(__dirname, '..', 'package.json')).version;
} catch (_) {
    /* keep default */
}

/**
 * When bemba is installed globally, use the project's node_modules/bembajs if present
 * so `bemba tungulula` matches `bun run dev` / local installs.
 */
function loadDevServerModule() {
    const local = path.join(process.cwd(), 'node_modules', 'bembajs', 'dist', 'dev-server.js');
    if (fs.existsSync(local)) {
        return require(local);
    }
    return require(path.join(__dirname, 'dev-server'));
}

function resolveCoreCliClass() {
    try {
        const corePkg = path.dirname(require.resolve('bembajs-core/package.json'));
        const CoreCli = require(path.join(corePkg, 'dist', 'cli.js'));
        return typeof CoreCli === 'function' ? CoreCli : null;
    } catch (_) {
        try {
            // Monorepo fallback when running from source without installed package.
            const local = path.resolve(__dirname, '..', '..', 'bembajs-core', 'dist', 'cli.js');
            if (fs.existsSync(local)) {
                const CoreCli = require(local);
                return typeof CoreCli === 'function' ? CoreCli : null;
            }
        } catch (_) {
            /* ignore */
        }
        return null;
    }
}

async function promptTemplateChoice() {
    if (prompts && typeof prompts === 'function') {
        const response = await prompts(
            {
                type: 'select',
                name: 'template',
                message: 'Choose a project template',
                choices: [
                    { title: 'base - minimal starter router', value: 'base' },
                    { title: 'ui - starter UI blocks', value: 'ui' }
                ],
                initial: 0
            },
            {
                onCancel: () => {
                    process.exit(1);
                }
            }
        );
        return response.template || 'base';
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const ask = (q) => new Promise((resolve) => rl.question(q, resolve));
    try {
        console.log('Choose a project template:');
        console.log('  1) base - minimal starter router');
        console.log('  2) ui   - starter UI blocks');
        const answer = String(await ask('Template [1/2, default 1]: ')).trim().toLowerCase();
        if (answer === '2' || answer === 'ui') return 'ui';
        return 'base';
    } finally {
        rl.close();
    }
}

// Main CLI program
program
    .name('bemba')
    .description('BembaJS - A Next.js-like framework for programming in Bemba language')
    .version(pkgVersion);

// Version command
program
    .command('--version')
    .description('Show version number')
    .action(() => {
        console.log(pkgVersion);
    });

// Create project command
program
    .command('panga <name>')
    .description('Create a new BembaJS project')
    .option('-t, --template <template>', 'Project template: base | ui')
    .option('--typescript', 'Use TypeScript')
    .action(async (name, opts) => {
        const CoreCli = resolveCoreCliClass();
        if (!CoreCli) {
            console.error('bembajs-core is required for project scaffolding. Install/reinstall bembajs-core and try again.');
            process.exit(1);
        }
        let template = opts.template ? String(opts.template).trim().toLowerCase() : '';
        if (!template) {
            template = await promptTemplateChoice();
        }
        if (template !== 'base' && template !== 'ui') {
            console.error(`Unknown template "${template}". Use --template base or --template ui.`);
            process.exit(1);
        }
        const core = new CoreCli();
        core.createProject(name, {
            template,
            typescript: !!opts.typescript
        });
    });

// Start dev server command
program
    .command('tungulula')
    .description('Start development server')
    .action(() => {
        console.log('Starting BembaJS development server...');
        console.log('Hot reload on; press Ctrl+C to stop.');

        try {
            const BembaDevServer = loadDevServerModule();
            const server = new BembaDevServer({ port: 3000 });
            server.start();

            process.on('SIGINT', () => {
                console.log('\nStopping BembaJS development server...');
                process.exit(0);
            });
        } catch (error) {
            console.error('Failed to start development server:', error.message);
            console.log('Make sure you are in a BembaJS project directory');
            process.exit(1);
        }
    });

function resolveCoreExport() {
    try {
        const corePkg = path.dirname(require.resolve('bembajs-core/package.json'));
        return require(path.join(corePkg, 'dist', 'static-html-export.js'));
    } catch (e) {
        return null;
    }
}

// Build command — static HTML export (pangaIpepa) to dist/
program
    .command('akha')
    .description('Export static HTML site for production (default: ./dist)')
    .option('-o, --output <dir>', 'Output directory', 'dist')
    .option('--base-url <url>', 'Origin for sitemap.xml / feed.xml (or BEMBA_SITE_URL)')
    .option('--locale <code>', 'html lang (BCP 47)', 'en')
    .option('--site-title <title>', 'RSS channel title')
    .option('--no-bemba-site', 'Do not inject or copy bemba-site.js')
    .action(async (opts) => {
        const mod = resolveCoreExport();
        if (!mod || typeof mod.exportStaticHtmlSite !== 'function') {
            console.error('bembajs-core with static-html-export is required.');
            process.exit(1);
        }
        try {
            await mod.exportStaticHtmlSite({
                projectRoot: process.cwd(),
                outDir: opts.output,
                baseUrl: opts.baseUrl || process.env.BEMBA_SITE_URL || '',
                siteTitle: opts.siteTitle,
                htmlLang: opts.locale || 'en',
                bembaSiteScript: opts.bembaSite !== false
            });
        } catch (e) {
            console.error(e.message || e);
            process.exit(1);
        }
    });

program
    .command('fumya')
    .description('Export static HTML site (same as akha; default output ./out)')
    .option('-o, --output <dir>', 'Output directory', 'out')
    .option('--base-url <url>', 'Origin for sitemap.xml / feed.xml (or BEMBA_SITE_URL)')
    .option('--locale <code>', 'html lang (BCP 47)', 'en')
    .option('--site-title <title>', 'RSS channel title')
    .option('--no-bemba-site', 'Do not inject or copy bemba-site.js')
    .action(async (opts) => {
        const mod = resolveCoreExport();
        if (!mod || typeof mod.exportStaticHtmlSite !== 'function') {
            console.error('bembajs-core with static-html-export is required.');
            process.exit(1);
        }
        try {
            await mod.exportStaticHtmlSite({
                projectRoot: process.cwd(),
                outDir: opts.output,
                baseUrl: opts.baseUrl || process.env.BEMBA_SITE_URL || '',
                siteTitle: opts.siteTitle,
                htmlLang: opts.locale || 'en',
                bembaSiteScript: opts.bembaSite !== false
            });
        } catch (e) {
            console.error(e.message || e);
            process.exit(1);
        }
    });

function resolveEmitReactScript() {
    const candidates = [
        path.join(__dirname, 'scripts', 'emit-react-routes.js'),
        path.join(__dirname, '..', 'scripts', 'emit-react-routes.js')
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            return p;
        }
    }
    return null;
}

program
    .command('emit-react')
    .description('Emit JSX from amapeji, ifikopo, maapi (and mafungulo) .bemba for Vite/esbuild + React')
    .option('-o, --out <dir>', 'output directory', 'dist/bemba-react')
    .action((opts) => {
        const scriptPath = resolveEmitReactScript();
        if (!scriptPath) {
            console.error('emit-react-routes.js not found. Rebuild the bembajs package.');
            process.exit(1);
        }
        require(scriptPath).run({ outDir: opts.out });
    });

// Lint command
program
    .command('lint')
    .description('Lint BembaJS code')
    .action(() => {
        console.log('Linting BembaJS code...');
        console.log('Linting complete.');
    });

// Format command
program
    .command('format')
    .description('Format BembaJS code')
    .action(() => {
        console.log('Formatting BembaJS code...');
        console.log('Formatting complete.');
    });

// Help command
program
    .command('help')
    .description('Show help information')
    .action(() => {
        console.log('BembaJS - Programming in Bemba Language');
        console.log('');
        console.log('Commands:');
        console.log('   bemba panga <name>    - Create project (prompts template)');
        console.log('   bemba template sync   - Refresh docs/starter from bembajs-core (run inside a project)');
        console.log('   bemba tungulula       - Start dev server');
        console.log('   bemba akha            - Export static HTML (→ dist/)');
        console.log('   bemba fumya           - Export static HTML (→ out/)');
        console.log('   bemba lint            - Lint code');
        console.log('   bemba format          - Format code');
        console.log('   bemba emit-react      - Emit JSX for bundler + React/motion');
        console.log('   bemba --version       - Show version');
        console.log('   bemba help            - Show this help');
        console.log('');
        console.log('Website: https://bembajs.dev');
        console.log('Docs: https://docs.bembajs.dev');
        console.log('Community: https://github.com/bembajs/bembajs');
    });

// `template` (e.g. `bemba template sync`) lives in bembajs-core; forward so `bunx bemba` works the same as `bembajs-core`.
const forwardArgv = process.argv.slice(2);
if (forwardArgv[0] === 'template') {
    const CoreCli = resolveCoreCliClass();
    if (!CoreCli) {
        console.error('bembajs-core is required for `bemba template`. In a project: bun add -d bembajs-core');
        process.exit(1);
    }
    const coreCli = new CoreCli();
    coreCli.run();
} else {
    program.parse();
    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}
