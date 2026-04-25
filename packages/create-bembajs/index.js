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
const prompts = require('prompts');
const chalkImport = require('chalk');
const oraImport = require('ora');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const validateProjectName = require('validate-npm-package-name');
const chalk = chalkImport.default ?? chalkImport;
const ora = oraImport.default ?? oraImport;

// Package version
const packageJson = require('./package.json');

// Detect if running with Bun (works for `bunx` and `bun create` subprocesses)
function detectBunRuntime() {
    if (typeof Bun !== 'undefined') return true;
    const ua = String(process.env.npm_config_user_agent || '').toLowerCase();
    if (ua.includes('bun/')) return true;
    const execPath = String(process.execPath || '').toLowerCase();
    if (execPath.includes('bun')) return true;
    const npmExecPath = String(process.env.npm_execpath || '').toLowerCase();
    if (npmExecPath.includes('bun')) return true;
    return false;
}
const isBun = detectBunRuntime();
const packageManager = 'bun';

// CLI setup
program
    .name('create-bembajs')
    .description('Create a new BembaJS application')
    .version(packageJson.version)
    .argument('[project-directory]', 'Project directory name')
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
 */
async function createApp(projectDirectory, options) {
    console.log();
    console.log(chalk.bold.cyan('🚀 Create BembaJS App'));
    console.log();

    // Get project name
    let projectName = projectDirectory;
    
    if (!projectName) {
        const response = await prompts({
            type: 'text',
            name: 'projectName',
            message: 'What is your project named?',
            initial: 'my-bemba-app',
            validate: name => {
                const validation = validateProjectName(name);
                if (validation.validForNewPackages) {
                    return true;
                }
                return 'Invalid project name: ' + (validation.errors || validation.warnings).join(', ');
            }
        });
        
        if (!response.projectName) {
            console.log();
            console.log('Please specify the project directory:');
            console.log(chalk.cyan(`  ${packageManager === 'bun' ? 'bunx' : 'npx'} create-bembajs`), chalk.green('<project-directory>'));
            console.log();
            process.exit(1);
        }
        
        projectName = response.projectName;
    }

    // Validate project name
    const validation = validateProjectName(projectName);
    if (!validation.validForNewPackages) {
        console.error(chalk.red(`Invalid project name: "${projectName}"`));
        validation.errors && validation.errors.forEach(err => console.error(chalk.red(`  - ${err}`)));
        validation.warnings && validation.warnings.forEach(warn => console.warn(chalk.yellow(`  - ${warn}`)));
        process.exit(1);
    }

    const projectPath = path.resolve(projectName);

    // Check if directory exists
    if (fs.existsSync(projectPath)) {
        console.error(chalk.red(`Directory "${projectName}" already exists.`));
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
        const response = await prompts({
            type: 'select',
            name: 'template',
            message: 'Which template would you like to use?',
            choices: [
                { title: 'Base (Recommended)', value: 'base', description: 'React-first App Router starter' },
                { title: 'UI Starter', value: 'ui', description: 'Base plus reusable UI starter blocks' }
            ],
            initial: 0
        });
        
        template = response.template || template || 'base';
    }

    if (template !== 'base' && template !== 'ui') {
        console.error(chalk.red(`Unknown template "${template}". Supported templates: base, ui.`));
        process.exit(1);
    }

    // TypeScript is opt-in via --typescript; default false for non-interactive create flow.
    const useTypeScript = options.typescript === true || hasFlag('--typescript');

    console.log();
    console.log(`Creating a new BembaJS app in ${chalk.green(projectPath)}`);
    console.log();

    // Create project directory
    const spinner = ora('Creating project directory...').start();
    try {
        fs.mkdirSync(projectPath, { recursive: true });
        spinner.succeed('Project directory created');
    } catch (error) {
        spinner.fail('Failed to create project directory');
        console.error(chalk.red(error.message));
        process.exit(1);
    }

    // Copy template
    spinner.start('Copying template files...');
    try {
        const templatePath = path.join(__dirname, 'templates', template);
        copyDirectory(templatePath, projectPath);
        writeProjectReadmeStub(projectPath, projectName);
        spinner.succeed('Template files copied');
    } catch (error) {
        spinner.fail('Failed to copy template files');
        console.error(chalk.red(error.message));
        process.exit(1);
    }

    // Update package.json
    spinner.start('Updating package metadata...');
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
        spinner.succeed('Package metadata updated');
    } catch (error) {
        spinner.fail('Failed to update package metadata');
        console.error(chalk.red(error.message));
        process.exit(1);
    }

    // Install dependencies
    const shouldInstall = options.install !== false && !hasFlag('--no-install');
    if (shouldInstall) {
        spinner.start(`Installing dependencies with ${packageManager}...`);
        try {
            execSync('bun install', { cwd: projectPath, stdio: 'ignore' });
            spinner.succeed('Dependencies installed');
        } catch (error) {
            spinner.fail('Failed to install dependencies');
            console.warn(chalk.yellow('You can install dependencies manually by running:'));
            console.warn(chalk.cyan(`  cd ${projectName}`));
            console.warn(chalk.cyan('  bun install'));
        }
    }

    // Initialize git
    const shouldInitGit = options.git !== false && !hasFlag('--no-git');
    if (shouldInitGit) {
        spinner.start('Initializing git repository...');
        try {
            execSync('git init', { cwd: projectPath, stdio: 'ignore' });
            execSync('git add -A', { cwd: projectPath, stdio: 'ignore' });
            execSync('git commit -m "Initial commit from create-bembajs"', { cwd: projectPath, stdio: 'ignore' });
            spinner.succeed('Git repository initialized');
        } catch (error) {
            spinner.warn('Git initialization skipped');
        }
    }

    // Success message
    console.log();
    console.log(chalk.green('✅ Success!'), `Created ${projectName} at ${projectPath}`);
    console.log();
    console.log('Inside that directory, you can run several commands:');
    console.log();
    console.log(chalk.cyan('  bun run dev'));
    console.log('    Starts the development server.');
    console.log();
    console.log(chalk.cyan('  bun run build'));
    console.log('    Builds the app for production.');
    console.log();
    console.log(chalk.cyan('  bun run start'));
    console.log('    Runs the built app in production mode.');
    console.log();
    console.log('We suggest that you begin by typing:');
    console.log();
    console.log(chalk.cyan('  cd'), projectName);
    console.log(`  ${chalk.cyan('bun run dev')}`);
    console.log();
    console.log('Happy coding with BembaJS! 🇿🇲');
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

