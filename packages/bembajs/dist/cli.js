#!/usr/bin/env node

/**
 * BembaJS CLI
 * Command-line interface for BembaJS framework
 */

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { parseEarlyLangFromArgv, normalizeLang, msg } = require('./cli-i18n');
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
                message: msg('chooseTemplate'),
                choices: [
                    { title: msg('tmplBase'), value: 'base' },
                    { title: msg('tmplUi'), value: 'ui' }
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
        console.log(msg('promptHeader'));
        console.log(msg('promptLine1'));
        console.log(msg('promptLine2'));
        const answer = String(await ask(msg('tmplPrompt'))).trim().toLowerCase();
        if (answer === '2' || answer === 'ui') return 'ui';
        return 'base';
    } finally {
        rl.close();
    }
}

// Main CLI program
const earlyLang = parseEarlyLangFromArgv(process.argv);
program
    .name('bemba')
    .description(msg('programDesc'))
    .version(pkgVersion)
    .option('-l, --lang <lang>', msg('optLang'), earlyLang);

program.hook('preAction', (thisCommand) => {
    const root = typeof thisCommand.root === 'function' ? thisCommand.root() : program;
    const opts = root.opts && root.opts();
    if (opts && opts.lang != null) {
        process.env.BEMBA_CLI_LANG = normalizeLang(opts.lang);
    }
});

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
    .description(msg('pangaDesc'))
    .option('-t, --template <template>', msg('optTemplate'))
    .option('--typescript', msg('optTypescript'))
    .action(async (name, opts) => {
        const CoreCli = resolveCoreCliClass();
        if (!CoreCli) {
            console.error(msg('coreMissingPanga'));
            process.exit(1);
        }
        let template = opts.template ? String(opts.template).trim().toLowerCase() : '';
        if (!template) {
            template = await promptTemplateChoice();
        }
        if (template !== 'base' && template !== 'ui') {
            console.error(msg('unknownTemplate', template));
            process.exit(1);
        }
        const coreCli = new CoreCli();
        coreCli.createProject(name, {
            template,
            typescript: !!opts.typescript
        });
    });

// Start dev server command
program
    .command('tungulula')
    .description(msg('tungululaDesc'))
    .action(() => {
        console.log(msg('startingDev'));
        console.log(msg('hotReload'));

        try {
            const BembaDevServer = loadDevServerModule();
            const server = new BembaDevServer({ port: 3000 });
            server.start();

            process.on('SIGINT', () => {
                console.log(`\n${msg('stoppingDev')}`);
                process.exit(0);
            });
        } catch (error) {
            console.error(msg('devStartErr'), error.message);
            console.log(msg('devCwdHint'));
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
    .description(msg('akhaDesc'))
    .option('-o, --output <dir>', msg('optOutput'), 'dist')
    .option('--base-url <url>', msg('optBaseUrl'))
    .option('--locale <code>', msg('optLocale'), 'en')
    .option('--site-title <title>', msg('optSiteTitle'))
    .option('--no-bemba-site', msg('optNoBembaSite'))
    .action(async (opts) => {
        const mod = resolveCoreExport();
        if (!mod || typeof mod.exportStaticHtmlSite !== 'function') {
            console.error(msg('exportMissing'));
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
    .description(msg('fumyaDesc'))
    .option('-o, --output <dir>', msg('optOutput'), 'out')
    .option('--base-url <url>', msg('optBaseUrl'))
    .option('--locale <code>', msg('optLocale'), 'en')
    .option('--site-title <title>', msg('optSiteTitle'))
    .option('--no-bemba-site', msg('optNoBembaSite'))
    .action(async (opts) => {
        const mod = resolveCoreExport();
        if (!mod || typeof mod.exportStaticHtmlSite !== 'function') {
            console.error(msg('exportMissing'));
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
    .description(msg('emitReactDesc'))
    .option('-o, --out <dir>', msg('optEmitOut'), 'dist/bemba-react')
    .action((opts) => {
        const scriptPath = resolveEmitReactScript();
        if (!scriptPath) {
            console.error(msg('emitScriptMissing'));
            process.exit(1);
        }
        require(scriptPath).run({ outDir: opts.out });
    });

// Lint command
program
    .command('lint')
    .description(msg('lintDesc'))
    .action(() => {
        console.log(msg('lintRunning'));
        console.log(msg('lintDone'));
    });

// Format command
program
    .command('format')
    .description(msg('formatDesc'))
    .action(() => {
        console.log(msg('formatRunning'));
        console.log(msg('formatDone'));
    });

// Help command
program
    .command('help')
    .description(msg('helpDesc'))
    .action(() => {
        console.log(msg('helpTitle'));
        console.log('');
        console.log('Commands:');
        console.log(`   ${msg('helpCmdPanga')}`);
        console.log(`   ${msg('helpCmdTemplate')}`);
        console.log(`   ${msg('helpCmdSyncTpl')}`);
        console.log(`   ${msg('helpCmdTungulula')}`);
        console.log(`   ${msg('helpCmdAkha')}`);
        console.log(`   ${msg('helpCmdFumya')}`);
        console.log(`   ${msg('helpCmdLint')}`);
        console.log(`   ${msg('helpCmdFormat')}`);
        console.log(`   ${msg('helpCmdEmit')}`);
        console.log(`   ${msg('helpCmdVersion')}`);
        console.log(`   ${msg('helpCmdHelp')}`);
        console.log('');
        console.log(msg('helpLangHint'));
        console.log('');
        console.log(msg('helpWebsite'));
        console.log(msg('helpDocs'));
        console.log(msg('helpGh'));
    });

// Subcommands implemented only in bembajs-core — forward so `bunx bemba` matches `bembajs-core`.
const forwardArgv = process.argv.slice(2);
const forwardToCore = forwardArgv[0] === 'template' || forwardArgv[0] === 'sync-template';
if (forwardToCore) {
    const CoreCli = resolveCoreCliClass();
    if (!CoreCli) {
        console.error(msg('coreMissingTemplate'));
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
