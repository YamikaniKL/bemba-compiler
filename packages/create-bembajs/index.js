#!/usr/bin/env node

/**
 * create-bembajs
 * Create a new BembaJS application (Next.js-style)
 * 
 * Usage:
 *   npm create bembajs@latest
 *   npx create-bembajs my-app
 *   bunx create-bembajs my-app
 */

const { program } = require('commander');
const prompts = require('prompts');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const validateProjectName = require('validate-npm-package-name');

// Package version
const packageJson = require('./package.json');

// Detect if running with Bun
const isBun = typeof Bun !== 'undefined';
const packageManager = isBun ? 'bun' : 'npm';

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

    // Get template choice if not specified
    let template = options.template;
    if (!template || template === 'base') {
        const response = await prompts({
            type: 'select',
            name: 'template',
            message: 'Which template would you like to use?',
            choices: [
                { title: 'Base (Recommended)', value: 'base', description: 'A basic BembaJS application' },
                { title: 'Dashboard', value: 'dashboard', description: 'Admin dashboard with components' },
                { title: 'E-commerce', value: 'ecommerce', description: 'Online store template' },
                { title: 'Blog', value: 'blog', description: 'Blog with markdown support' }
            ],
            initial: 0
        });
        
        template = response.template || 'base';
    }

    // Get TypeScript preference
    let useTypeScript = options.typescript;
    if (useTypeScript === undefined) {
        const response = await prompts({
            type: 'confirm',
            name: 'typescript',
            message: 'Would you like to use TypeScript?',
            initial: false
        });
        
        useTypeScript = response.typescript;
    }

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
        spinner.succeed('Template files copied');
    } catch (error) {
        spinner.fail('Failed to copy template files');
        console.error(chalk.red(error.message));
        process.exit(1);
    }

    // Create package.json
    spinner.start('Creating package.json...');
    try {
        const packageJsonContent = {
            name: projectName,
            version: '0.1.0',
            private: true,
            scripts: {
                dev: 'bemba tungulula',
                build: 'bemba akha',
                start: 'bemba start',
                lint: 'bemba lint',
                format: 'bemba format'
            },
            dependencies: {
                bembajs: '^1.0.0',
                react: '^18.2.0',
                'react-dom': '^18.2.0'
            },
            devDependencies: useTypeScript ? {
                typescript: '^5.0.0',
                '@types/react': '^18.2.0',
                '@types/react-dom': '^18.2.0'
            } : {}
        };
        
        fs.writeFileSync(
            path.join(projectPath, 'package.json'),
            JSON.stringify(packageJsonContent, null, 2)
        );
        spinner.succeed('package.json created');
    } catch (error) {
        spinner.fail('Failed to create package.json');
        console.error(chalk.red(error.message));
        process.exit(1);
    }

    // Install dependencies
    if (options.install !== false) {
        spinner.start(`Installing dependencies with ${packageManager}...`);
        try {
            const installCmd = packageManager === 'bun' ? 'bun install' : 'npm install';
            execSync(installCmd, { cwd: projectPath, stdio: 'ignore' });
            spinner.succeed('Dependencies installed');
        } catch (error) {
            spinner.fail('Failed to install dependencies');
            console.warn(chalk.yellow('You can install dependencies manually by running:'));
            console.warn(chalk.cyan(`  cd ${projectName}`));
            console.warn(chalk.cyan(`  ${packageManager} install`));
        }
    }

    // Initialize git
    if (options.git !== false) {
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
    console.log(chalk.cyan(`  ${packageManager} run dev`));
    console.log('    Starts the development server.');
    console.log();
    console.log(chalk.cyan(`  ${packageManager} run build`));
    console.log('    Builds the app for production.');
    console.log();
    console.log(chalk.cyan(`  ${packageManager} start`));
    console.log('    Runs the built app in production mode.');
    console.log();
    console.log('We suggest that you begin by typing:');
    console.log();
    console.log(chalk.cyan('  cd'), projectName);
    console.log(`  ${chalk.cyan(`${packageManager} run dev`)}`);
    console.log();
    console.log('Happy coding with BembaJS! 🇿🇲');
    console.log();
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

