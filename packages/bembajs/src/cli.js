#!/usr/bin/env node

/**
 * BembaJS CLI
 * Command-line interface for BembaJS framework
 */

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { spawnSync } = require('child_process');
const {
    normalizeLang,
    msg,
    langExplicitInArgv,
    hasPersistedCliLangEnv,
    parseLangFromArgvOnly
} = require('./cli-i18n');
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
/** True if `dir` is a directory tree that contains at least one `.bemba` file (pages folder). */
function directoryHasBembaPages(dir) {
    try {
        if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) {
                if (directoryHasBembaPages(full)) return true;
            } else if (ent.isFile() && ent.name.endsWith('.bemba')) {
                return true;
            }
        }
    } catch (_) {
        return false;
    }
    return false;
}

function isBembaJsProjectCwd(cwd) {
    return directoryHasBembaPages(path.join(cwd, 'amapeji'));
}

function loadDevServerModule() {
    const local = path.join(process.cwd(), 'node_modules', 'bembajs', 'dist', 'dev-server.js');
    if (fs.existsSync(local)) {
        return require(local);
    }
    return require(path.join(__dirname, 'dev-server'));
}

async function promptCliLanguageIfNeeded() {
    if (langExplicitInArgv(process.argv) || hasPersistedCliLangEnv()) return;
    const picked = await promptLanguageChoice();
    process.env.BEMBA_CLI_LANG = picked;
}

async function runCreateProjectFlow(name, commanderOpts) {
    const CoreCli = resolveCoreCliClass();
    if (!CoreCli) {
        console.error(msg('coreMissingPanga'));
        process.exit(1);
    }

    await promptCliLanguageIfNeeded();

    let projectName = name != null ? String(name).trim() : '';
    if (projectName && !isValidProjectName(projectName)) {
        console.error(msg('invalidProjectName'));
        process.exit(1);
    }
    if (!projectName) {
        do {
            projectName = await promptProjectName();
            if (!isValidProjectName(projectName)) {
                console.error(msg('invalidProjectName'));
            }
        } while (!isValidProjectName(projectName));
    }

    let template = commanderOpts.template ? String(commanderOpts.template).trim().toLowerCase() : '';
    if (!template) {
        template = await promptTemplateChoice();
    }
    if (template !== 'base' && template !== 'ui') {
        console.error(msg('unknownTemplate', template));
        process.exit(1);
    }
    const coreCli = new CoreCli();
    coreCli.createProject(projectName, {
        template,
        typescript: !!commanderOpts.typescript
    });
}

function runTungululaCli() {
    if (!isBembaJsProjectCwd(process.cwd())) {
        console.error(msg('devNoProject'));
        process.exit(1);
    }

    const CoreCli = resolveCoreCliClass();
    if (CoreCli) {
        const coreCli = new CoreCli();
        coreCli.startDevServer({ port: 3000, host: 'localhost' }).catch((error) => {
            console.error(msg('devStartErr'), error && error.message ? error.message : String(error));
            process.exit(1);
        });
        return;
    }

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
}

function printBembaHelpText() {
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
}

async function promptMainMenuChoice() {
    if (prompts && typeof prompts === 'function') {
        const response = await prompts(
            {
                type: 'select',
                name: 'choice',
                message: msg('mainMenuTitle'),
                choices: [
                    { title: msg('mainMenuCreate'), value: 'create' },
                    { title: msg('mainMenuHelp'), value: 'help' },
                    { title: msg('mainMenuExit'), value: 'exit' }
                ],
                initial: 0
            },
            {
                onCancel: () => {
                    process.exit(1);
                }
            }
        );
        return response.choice || 'exit';
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const ask = (q) => new Promise((resolve) => rl.question(q, resolve));
    try {
        const answer = String(await ask(msg('mainMenuPromptRl'))).trim().toLowerCase();
        if (answer === '2' || answer === 'help') return 'help';
        if (answer === '3' || answer === 'exit' || answer === 'quit') return 'exit';
        return 'create';
    } finally {
        rl.close();
    }
}

async function runInteractiveMainMenu() {
    const argvLang = parseLangFromArgvOnly(process.argv);
    if (argvLang) {
        process.env.BEMBA_CLI_LANG = normalizeLang(argvLang);
    }
    await promptCliLanguageIfNeeded();

    const choice = await promptMainMenuChoice();
    if (choice === 'create') {
        await runCreateProjectFlow(undefined, {});
    } else if (choice === 'help') {
        printBembaHelpText();
    } else {
        process.exit(0);
    }
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

async function promptLanguageChoice() {
    if (prompts && typeof prompts === 'function') {
        const response = await prompts(
            {
                type: 'select',
                name: 'lang',
                message: msg('chooseCliLang'),
                choices: [
                    { title: msg('langChoiceEnglish'), value: 'en' },
                    { title: msg('langChoiceBemba'), value: 'bem' }
                ],
                initial: 0
            },
            {
                onCancel: () => {
                    process.exit(1);
                }
            }
        );
        return response.lang === 'bem' ? 'bem' : 'en';
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const ask = (q) => new Promise((resolve) => rl.question(q, resolve));
    try {
        const answer = String(await ask(msg('langPromptRl'))).trim().toLowerCase();
        if (answer === '2' || answer === 'bem' || answer === 'bemba') return 'bem';
        return 'en';
    } finally {
        rl.close();
    }
}

function argvWithoutLangFlags(argv) {
    const a = [...argv];
    for (let i = 0; i < a.length; i++) {
        if (a[i] === '-l' || a[i] === '--lang') {
            a.splice(i, 2);
            i--;
            continue;
        }
        if (a[i] && a[i].startsWith('--lang=')) {
            a.splice(i, 1);
            i--;
        }
    }
    return a;
}

function isValidProjectName(name) {
    const n = String(name || '').trim();
    if (!n || n.length > 128) return false;
    if (n.includes('/') || n.includes('\\') || n.startsWith('.')) return false;
    return /^[a-zA-Z0-9._-]+$/.test(n);
}

async function promptProjectName() {
    if (prompts && typeof prompts === 'function') {
        const response = await prompts(
            {
                type: 'text',
                name: 'name',
                message: msg('projectNamePrompt'),
                validate: (s) => (s && String(s).trim() ? true : msg('projectNameRequired'))
            },
            {
                onCancel: () => {
                    process.exit(1);
                }
            }
        );
        return String(response.name || '').trim();
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const ask = (q) => new Promise((resolve) => rl.question(q, resolve));
    try {
        let out = '';
        while (!out) {
            out = String(await ask(msg('projectNameRl'))).trim();
            if (!out) console.log(msg('projectNameRequired'));
        }
        return out;
    } finally {
        rl.close();
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
program
    .name('bemba')
    .description(msg('programDesc'))
    .version(pkgVersion)
    .option('-l, --lang <lang>', msg('optLang'));

program.hook('preAction', (thisCommand) => {
    const root = typeof thisCommand.root === 'function' ? thisCommand.root() : program;
    const opts = root.opts && root.opts();
    if (opts && opts.lang != null && String(opts.lang).trim() !== '') {
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
    .command('panga')
    .argument('[name]', msg('pangaArgName'))
    .description(msg('pangaDesc'))
    .option('-t, --template <template>', msg('optTemplate'))
    .option('--typescript', msg('optTypescript'))
    .action(async (name, opts) => {
        await runCreateProjectFlow(name, opts);
    });

// Start dev server command
program
    .command('tungulula')
    .description(msg('tungululaDesc'))
    .action(() => {
        runTungululaCli();
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
        const eslintBin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'eslint.cmd' : 'eslint');
        if (!fs.existsSync(eslintBin)) {
            console.log('ESLint is not installed in this project. Install it to run `bemba lint`.');
            return;
        }
        const result = spawnSync(eslintBin, ['.'], { stdio: 'inherit' });
        if (result.status !== 0) process.exit(result.status || 1);
        console.log(msg('lintDone'));
    });

// Format command
program
    .command('format')
    .description(msg('formatDesc'))
    .action(() => {
        console.log(msg('formatRunning'));
        const prettierBin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'prettier.cmd' : 'prettier');
        if (!fs.existsSync(prettierBin)) {
            console.log('Prettier is not installed in this project. Install it to run `bemba format`.');
            return;
        }
        const result = spawnSync(prettierBin, ['--write', '.'], { stdio: 'inherit' });
        if (result.status !== 0) process.exit(result.status || 1);
        console.log(msg('formatDone'));
    });

program
    .command('test')
    .description('Run project tests')
    .option('--watch', 'Run tests in watch mode')
    .action((opts) => {
        const args = ['--test'];
        if (opts && opts.watch) args.push('--watch');
        const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
        if (result.status !== 0) process.exit(result.status || 1);
    });

// Help command
program
    .command('help')
    .description(msg('helpDesc'))
    .action(() => {
        printBembaHelpText();
    });

// Subcommands implemented only in bembajs-core — forward so `bunx bemba` matches `bembajs-core`.
const forwardArgv = process.argv.slice(2);
const forwardLook = argvWithoutLangFlags(forwardArgv);
const forwardToCore = forwardLook[0] === 'template' || forwardLook[0] === 'sync-template';
if (forwardToCore) {
    const CoreCli = resolveCoreCliClass();
    if (!CoreCli) {
        console.error(msg('coreMissingTemplate'));
        process.exit(1);
    }
    const coreCli = new CoreCli();
    coreCli.run();
} else {
    const stripped = argvWithoutLangFlags(forwardArgv);
    if (stripped.length === 0) {
        runInteractiveMainMenu().catch((e) => {
            console.error(e);
            process.exit(1);
        });
    } else {
        program.parse();
    }
}
