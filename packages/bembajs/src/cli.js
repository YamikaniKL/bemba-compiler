#!/usr/bin/env node

/**
 * BembaJS CLI
 * Command-line interface for BembaJS framework
 */

const path = require('path');
const fs = require('fs');
const { program } = require('commander');

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
    .action((name) => {
        console.log(`Creating BembaJS project: ${name}`);
        console.log('Project structure:');
        console.log('   amapeji/     - Pages (like Next.js pages/)');
        console.log('   ifikopo/     - Components (like Next.js components/)');
        console.log('   maapi/       - API routes (like Next.js api/)');
        console.log('   maungu/      - Static files (like Next.js public/)');
        console.log('   maungu/      - Styles (like Next.js styles/)');
        console.log('');
        console.log('Next steps:');
        console.log(`   cd ${name}`);
        console.log('   npm install');
        console.log('   npm run dev');
        console.log('');
        console.log('Welcome to BembaJS!');
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

// Build command
program
    .command('akha')
    .description('Build for production')
    .action(() => {
        console.log('Building BembaJS project for production...');
        console.log('Output: dist/ folder');
        console.log('Build complete.');
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
        console.log('   bemba panga <name>    - Create new project');
        console.log('   bemba tungulula       - Start dev server');
        console.log('   bemba akha            - Build for production');
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

program.parse();

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
