#!/usr/bin/env node

/**
 * create-bembajs
 * Create a new BembaJS application (Next.js-style)
 *
 * Usage:
 *   bun create bembajs@latest
 *   bunx create-bembajs my-app
 */

const { program } = require('commander');
// Patch prompts figures before `prompts` loads style (avoids Unicode ticks on Windows).
try {
    const fig = require('prompts/lib/util/figures');
    fig.tick = '>';
    fig.cross = 'x';
    fig.pointer = '>';
    fig.pointerSmall = '>';
} catch (_) {
    /* optional */
}
const prompts = require('prompts');
const chalkImport = require('chalk');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const validateProjectName = require('validate-npm-package-name');
const chalk = chalkImport.default ?? chalkImport;

// Package version
const packageJson = require('./package.json');

/** @typedef {'en' | 'bem'} CliLang */

/** @type {Record<CliLang, Record<string, string | ((...args: unknown[]) => string)>>} */
const STR = {
    en: {
        banner: 'Create BembaJS App',
        chooseCliLang: 'Choose CLI language · Sala ululomi (prompts + scaffolding)',
        langEnglish: 'English',
        langBemba: 'Bemba (CLI messages in Bemba)',
        projectNamePrompt: 'What is your project named?',
        projectNameInitial: 'my-bemba-app',
        specifyProjectDir: 'Please specify the project directory:',
        invalidProjectName: 'Invalid project name:',
        directoryExists: (name) => `Directory "${name}" already exists.`,
        templatePrompt: 'Which template would you like to use?',
        tmplBaseTitle: 'Base (Recommended)',
        tmplBaseDesc: 'React-first App Router starter',
        tmplUiTitle: 'UI Starter',
        tmplUiDesc: 'Base plus reusable UI starter blocks',
        unknownTemplate: (tpl) =>
            `Unknown template "${tpl}". Supported templates: base, ui.`,
        creatingIn: (p) => `Creating a new BembaJS app in ${p}`,
        spinnerMkDir: 'Creating project directory...',
        spinnerMkDirOk: 'Project directory created',
        spinnerMkDirFail: 'Failed to create project directory',
        spinnerCopy: 'Copying template files...',
        spinnerCopyOk: 'Template files copied',
        spinnerCopyFail: 'Failed to copy template files',
        spinnerPkg: 'Updating package metadata...',
        spinnerPkgOk: 'Package metadata updated',
        spinnerPkgFail: 'Failed to update package metadata',
        spinnerInstall: (pm) => `Installing dependencies with ${pm}...`,
        spinnerInstallOk: 'Dependencies installed',
        spinnerInstallFail: 'Failed to install dependencies',
        installManual: 'You can install dependencies manually by running:',
        spinnerGit: 'Initializing git repository...',
        spinnerGitOk: 'Git repository initialized',
        spinnerGitSkip: 'Git initialization skipped',
        success: 'Success!',
        successCreated: (name, p) => `Created ${name} at ${p}`,
        nextStepsTitle: 'In that folder, use the Bemba CLI (bemba …) — package.json maps bun run to the same commands:',
        bembaDevDesc: 'Start the development server. Same as: bun run dev',
        bembaBuildDesc: 'Production build (Injini / Vite). Same as: bun run build',
        bembaExportDesc: 'Static export (pangaIpepa). Same as: bun run export',
        bembaStartDesc: 'After build, run the production server. Same as: bun run start',
        suggestBegin: 'Suggested first commands:',
        bunEquivNote: 'Tip: bun run dev | build | export | start are shortcuts to the bemba commands in package.json.',
        happyCoding: 'Happy coding with BembaJS.'
    },
    bem: {
        banner: 'Panga application ya BembaJS',
        chooseCliLang: 'Sala ululomi lwa CLI · Choose language (mapeeso + project)',
        langEnglish: 'Icilungu (English)',
        langBemba: 'Icifulo ca Bemba',
        projectNamePrompt: 'Ni nshi ishina lyabufolder?',
        projectNameInitial: 'my-bemba-app',
        specifyProjectDir: 'Lesa ishina lyabufolder:',
        invalidProjectName: 'Ishina lyabufolder tashilungika:',
        directoryExists: (name) => `Bufolder "${name}" buliko kale.`,
        templatePrompt: 'Ni fishe fyakufwile?',
        tmplBaseTitle: 'Base (recommended)',
        tmplBaseDesc: 'Starter ya React / App Router',
        tmplUiTitle: 'UI Starter',
        tmplUiDesc: 'Base + ama block ya UI',
        unknownTemplate: (tpl) =>
            `Ifishi "${tpl}" tashishishiba. Ukufwile base nangu ui.`,
        creatingIn: (p) => `Tupanga project ku ${p}`,
        spinnerMkDir: 'Tupanga bufolder...',
        spinnerMkDirOk: 'Bufolder bwapangwa',
        spinnerMkDirFail: 'Twashilibwesha ukupanga bufolder',
        spinnerCopy: 'Tukopilela ifishi...',
        spinnerCopyOk: 'Ifishi fyakopilelwa',
        spinnerCopyFail: 'Twashilibwesha ukukopilela ifishi',
        spinnerPkg: 'Tusansa package.json...',
        spinnerPkgOk: 'Package metadata yasanswa',
        spinnerPkgFail: 'Twashilibwesha ukusansa package metadata',
        spinnerInstall: (pm) => `Tushishikisha dependencies ne ${pm}...`,
        spinnerInstallOk: 'Dependencies yashishikishwa',
        spinnerInstallFail: 'Twashilibwesha ukushishikisha dependencies',
        installManual: 'Ulefwaya ukushishikisha pe, cinshi:',
        spinnerGit: 'Tupanga git...',
        spinnerGitOk: 'Git yapangwa',
        spinnerGitSkip: 'Git tayapangwa',
        success: 'Kwapwa!',
        successCreated: (name, p) => `Yapangwa ${name} ku ${p}`,
        nextStepsTitle:
            'Mu bufolder, ukafwile ukubikisha bemba … — package.json yakonkola bun run ku mapaishi yamo:',
        bembaDevDesc: 'Gulula sava yakupanga. Cimo ne: bun run dev',
        bembaBuildDesc: 'Akha pa production (Injini / Vite). Cimo ne: bun run build',
        bembaExportDesc: 'Fumya static (pangaIpepa). Cimo ne: bun run export',
        bembaStartDesc: 'Panuma ku akha, gulula sava ya production. Cimo ne: bun run start',
        suggestBegin: 'Ifyo tulakonkolesha ukutampa:',
        bunEquivNote: 'bun run dev | build | export | start fyakubikisha pa mapaishi ya bemba mu package.json.',
        happyCoding: 'Ukupanga mwafwaya.'
    }
};

/** Plain progress lines (no spinners / emoji). */
function logDoing(lang, key, ...args) {
    console.log(`.. ${t(lang, key, ...args)}`);
}

function logDone(lang, key, ...args) {
    console.log(`ok ${t(lang, key, ...args)}`);
}

function logWarn(lang, key, ...args) {
    console.log(`-- ${t(lang, key, ...args)}`);
}

function gitEnv() {
    return {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0'
    };
}

/** Prefer the public npm registry so installs resolve (avoids stale mirrors / misconfigured default registry). */
const NPM_PUBLIC_REGISTRY = 'https://registry.npmjs.org/';

function installEnv() {
    return {
        ...gitEnv(),
        NPM_CONFIG_REGISTRY: NPM_PUBLIC_REGISTRY
    };
}

/**
 * @param {CliLang} lang
 * @param {string} key
 * @param {...unknown} args
 */
function t(lang, key, ...args) {
    const bucket = STR[lang] || STR.en;
    const val = bucket[key] != null ? bucket[key] : STR.en[key];
    if (typeof val === 'function') return /** @type {(...a: unknown[]) => string} */ (val)(...args);
    return val != null ? String(val) : key;
}

function normalizeLang(raw) {
    const s = String(raw == null ? 'en' : raw)
        .trim()
        .toLowerCase();
    if (s === 'bem' || s === 'bemba' || s === 'ci-bemba') return 'bem';
    return 'en';
}

function hasPersistedCliLangEnv() {
    const v = process.env.BEMBA_CLI_LANG;
    return v != null && String(v).trim() !== '';
}

function parseLangFromArgv(argv) {
    const args = argv || process.argv;
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-l' || a === '--lang') {
            const v = args[i + 1];
            if (v && !v.startsWith('-')) return normalizeLang(v);
        }
        if (typeof a === 'string' && a.startsWith('--lang=')) {
            return normalizeLang(a.slice('--lang='.length));
        }
    }
    return undefined;
}

async function promptLanguageChoice() {
    const lang = 'en';
    const response = await prompts(
        {
            type: 'select',
            name: 'lang',
            message: t(lang, 'chooseCliLang'),
            choices: [
                { title: t(lang, 'langEnglish'), value: 'en' },
                { title: t(lang, 'langBemba'), value: 'bem' }
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

/**
 * @param {{ lang?: string }} options
 * @returns {Promise<CliLang>}
 */
async function resolveCliLang(options) {
    const fromOpt = options.lang != null && String(options.lang).trim() !== '';
    if (fromOpt) return normalizeLang(options.lang);
    const fromArgv = parseLangFromArgv(process.argv);
    if (fromArgv !== undefined) return fromArgv;
    if (hasPersistedCliLangEnv()) return normalizeLang(process.env.BEMBA_CLI_LANG);
    if (!process.stdin.isTTY) return 'en';
    return promptLanguageChoice();
}

const packageManager = 'bun';

// CLI setup
program
    .name('create-bembajs')
    .description('Create a new BembaJS application')
    .version(packageJson.version)
    .argument('[project-directory]', 'Project directory name')
    .option('-l, --lang <lang>', 'CLI language for prompts: en | bem (or set BEMBA_CLI_LANG)')
    .option('--template <template>', 'Template to use', 'base')
    .option('--typescript', 'Use TypeScript')
    .option('--no-install', 'Skip dependency installation')
    .option('--no-git', 'Skip git initialization')
    .action(async (projectDirectory, options) => {
        await createApp(projectDirectory, options);
    });

program.parse();

/**
 * Main function to create a new BembaJS app
 * @param {string | undefined} projectDirectory
 * @param {{ template?: string, typescript?: boolean, install?: boolean, git?: boolean, lang?: string }} options
 */
async function createApp(projectDirectory, options) {
    const lang = await resolveCliLang(options);

    console.log();
    console.log(chalk.bold(t(lang, 'banner')));
    console.log();

    // Get project name
    let projectName = projectDirectory;

    if (!projectName) {
        const response = await prompts(
            {
                type: 'text',
                name: 'projectName',
                message: t(lang, 'projectNamePrompt'),
                initial: t(lang, 'projectNameInitial'),
                validate: (name) => {
                    const validation = validateProjectName(name);
                    if (validation.validForNewPackages) {
                        return true;
                    }
                    return `${t(lang, 'invalidProjectName')} ${(validation.errors || validation.warnings).join(', ')}`;
                }
            },
            {
                onCancel: () => {
                    process.exit(1);
                }
            }
        );

        if (!response.projectName) {
            console.log();
            console.log(t(lang, 'specifyProjectDir'));
            console.log(chalk.cyan(`  ${packageManager === 'bun' ? 'bunx' : 'npx'} create-bembajs`), chalk.green('<project-directory>'));
            console.log();
            process.exit(1);
        }

        projectName = response.projectName;
    }

    // Validate project name
    const validation = validateProjectName(projectName);
    if (!validation.validForNewPackages) {
        console.error(chalk.red(`${t(lang, 'invalidProjectName')} "${projectName}"`));
        validation.errors && validation.errors.forEach((err) => console.error(chalk.red(`  - ${err}`)));
        validation.warnings && validation.warnings.forEach((warn) => console.warn(chalk.yellow(`  - ${warn}`)));
        process.exit(1);
    }

    const projectPath = path.resolve(projectName);

    // Check if directory exists
    if (fs.existsSync(projectPath)) {
        console.error(chalk.red(t(lang, 'directoryExists', projectName)));
        process.exit(1);
    }

    // Handle wrapper passthrough quirks (bun create / npm create) by inspecting raw argv too.
    const rawArgv = process.argv.slice(2);
    const hasFlag = (name) => rawArgv.includes(name);
    const getFlagValue = (name) => {
        const idx = rawArgv.indexOf(name);
        if (idx >= 0 && idx + 1 < rawArgv.length) return rawArgv[idx + 1];
        const prefixed = rawArgv.find((a) => a.startsWith(`${name}=`));
        if (prefixed) return prefixed.slice(name.length + 1);
        return undefined;
    };

    // Get template choice only when caller did not explicitly pass --template
    const templateWasExplicit = hasFlag('--template') || getFlagValue('--template') !== undefined;
    let template = options.template;
    const explicitTemplate = getFlagValue('--template');
    if (explicitTemplate) template = explicitTemplate;
    if (!templateWasExplicit) {
        const response = await prompts(
            {
                type: 'select',
                name: 'template',
                message: t(lang, 'templatePrompt'),
                choices: [
                    { title: t(lang, 'tmplBaseTitle'), value: 'base', description: t(lang, 'tmplBaseDesc') },
                    { title: t(lang, 'tmplUiTitle'), value: 'ui', description: t(lang, 'tmplUiDesc') }
                ],
                initial: 0
            },
            {
                onCancel: () => {
                    process.exit(1);
                }
            }
        );

        template = response.template || template || 'base';
    }

    if (template !== 'base' && template !== 'ui') {
        console.error(chalk.red(t(lang, 'unknownTemplate', template)));
        process.exit(1);
    }

    // TypeScript is opt-in via --typescript; default false for non-interactive create flow.
    const useTypeScript = options.typescript === true || hasFlag('--typescript');

    console.log();
    console.log(t(lang, 'creatingIn', chalk.green(projectPath)));
    console.log();

    // Create project directory
    logDoing(lang, 'spinnerMkDir');
    try {
        fs.mkdirSync(projectPath, { recursive: true });
        logDone(lang, 'spinnerMkDirOk');
    } catch (error) {
        console.error(chalk.red(t(lang, 'spinnerMkDirFail')));
        console.error(chalk.red(error.message));
        process.exit(1);
    }

    // Copy template
    logDoing(lang, 'spinnerCopy');
    try {
        const templatePath = path.join(__dirname, 'templates', template);
        copyDirectory(templatePath, projectPath);
        writeProjectReadmeStub(projectPath, projectName);
        logDone(lang, 'spinnerCopyOk');
    } catch (error) {
        console.error(chalk.red(t(lang, 'spinnerCopyFail')));
        console.error(chalk.red(error.message));
        process.exit(1);
    }

    // Persist CLI language preference for `bemba` in the new project (optional; bembajs reads BEMBA_CLI_LANG)
    try {
        const envLine = `BEMBA_CLI_LANG=${lang === 'bem' ? 'bem' : 'en'}\n`;
        const envPath = path.join(projectPath, '.env');
        fs.writeFileSync(envPath, envLine, 'utf8');
    } catch (_) {
        /* non-fatal */
    }

    // Update package.json
    logDoing(lang, 'spinnerPkg');
    try {
        const packageJsonPath = path.join(projectPath, 'package.json');
        const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJsonContent.name = projectName;
        packageJsonContent.version = packageJsonContent.version || '1.0.0';
        packageJsonContent.private = true;

        if (useTypeScript) {
            packageJsonContent.devDependencies = {
                ...(packageJsonContent.devDependencies || {}),
                typescript: packageJsonContent.devDependencies?.typescript || '^5.0.0',
                '@types/react': packageJsonContent.devDependencies?.['@types/react'] || '^18.2.0',
                '@types/react-dom': packageJsonContent.devDependencies?.['@types/react-dom'] || '^18.2.0'
            };
        }

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
        logDone(lang, 'spinnerPkgOk');
    } catch (error) {
        console.error(chalk.red(t(lang, 'spinnerPkgFail')));
        console.error(chalk.red(error.message));
        process.exit(1);
    }

    // Install dependencies
    const shouldInstall = options.install !== false && !hasFlag('--no-install');
    if (shouldInstall) {
        logDoing(lang, 'spinnerInstall', packageManager);
        try {
            execSync(`bun install --registry ${NPM_PUBLIC_REGISTRY}`, {
                cwd: projectPath,
                stdio: 'ignore',
                env: installEnv()
            });
            logDone(lang, 'spinnerInstallOk');
        } catch (error) {
            try {
                execSync(`npm install --registry=${NPM_PUBLIC_REGISTRY}`, {
                    cwd: projectPath,
                    stdio: 'ignore',
                    env: installEnv()
                });
                logDone(lang, 'spinnerInstallOk');
            } catch (_) {
                console.error(chalk.red(t(lang, 'spinnerInstallFail')));
                console.warn(chalk.yellow(t(lang, 'installManual')));
                console.warn(chalk.cyan(`  cd ${projectName}`));
                console.warn(chalk.cyan(`  bun install --registry ${NPM_PUBLIC_REGISTRY}`));
                console.warn(chalk.gray(`  npm install --registry=${NPM_PUBLIC_REGISTRY}`));
            }
        }
    }

    // Initialize git (inline user.* avoids hang when global git identity is unset)
    const shouldInitGit = options.git !== false && !hasFlag('--no-git');
    if (shouldInitGit) {
        logDoing(lang, 'spinnerGit');
        try {
            execSync('git init -b main', { cwd: projectPath, stdio: 'ignore', env: gitEnv() });
            execSync('git add -A', { cwd: projectPath, stdio: 'ignore', env: gitEnv() });
            execSync(
                'git -c user.email=noreply@create-bembajs.local -c user.name=create-bembajs commit -m "Initial commit from create-bembajs"',
                { cwd: projectPath, stdio: 'ignore', env: gitEnv() }
            );
            logDone(lang, 'spinnerGitOk');
        } catch (error) {
            logWarn(lang, 'spinnerGitSkip');
        }
    }

    // Success message
    console.log();
    console.log(chalk.green(`${t(lang, 'success')} ${t(lang, 'successCreated', projectName, projectPath)}`));
    console.log();
    console.log(t(lang, 'nextStepsTitle'));
    console.log();
    console.log(t(lang, 'suggestBegin'));
    console.log();
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log();
    console.log(chalk.cyan('  bemba tungulula'));
    console.log(`    ${t(lang, 'bembaDevDesc')}`);
    console.log();
    console.log(chalk.cyan('  bemba akha'));
    console.log(`    ${t(lang, 'bembaBuildDesc')}`);
    console.log();
    console.log(chalk.cyan('  bemba fumya'));
    console.log(`    ${t(lang, 'bembaExportDesc')}`);
    console.log();
    console.log(chalk.cyan('  bun run start'));
    console.log(`    ${t(lang, 'bembaStartDesc')}`);
    console.log();
    console.log(t(lang, 'bunEquivNote'));
    console.log();
    console.log(t(lang, 'happyCoding'));
    console.log();
}

/** Minimal README — full docs live in the monorepo (no template .md in repo). */
function writeProjectReadmeStub(projectPath, projectName) {
    const body = `# ${projectName}

[Bemba compiler documentation](https://github.com/YamikaniKL/bemba-compiler)

\`\`\`bash
bun install
bun run dev
\`\`\`

## Production

\`\`\`bash
bun run build
node dist/server.mjs
\`\`\`

## Static export (pangaIpepa pages)

\`\`\`bash
bun run export
\`\`\`
`;
    fs.writeFileSync(path.join(projectPath, 'README.md'), body, 'utf8');
}

/**
 * Recursively copy directory
 */
function copyDirectory(src, dest) {
    if (!fs.existsSync(src)) {
        throw new Error(`Template directory not found: ${src}`);
    }

    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
