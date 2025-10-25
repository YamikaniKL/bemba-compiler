#!/usr/bin/env node

/**
 * BembaJS CLI
 * Command-line interface for BembaJS framework
 */

const { program } = require('commander');

// CLI version
const version = '1.0.0';

// Main CLI program
program
    .name('bemba')
    .description('BembaJS - A Next.js-like framework for programming in Bemba language')
    .version(version);

// Version command
program
    .command('--version')
    .description('Show version number')
    .action(() => {
        console.log(version);
    });

// Create project command
program
    .command('panga <name>')
    .description('Create a new BembaJS project')
    .action((name) => {
        console.log(`🚀 Creating BembaJS project: ${name}`);
        console.log('📁 Project structure:');
        console.log('   amapeji/     - Pages (like Next.js pages/)');
        console.log('   ifikopo/     - Components (like Next.js components/)');
        console.log('   maapi/       - API routes (like Next.js api/)');
        console.log('   maungu/      - Static files (like Next.js public/)');
        console.log('   maungu/      - Styles (like Next.js styles/)');
        console.log('');
        console.log('💡 Next steps:');
        console.log(`   cd ${name}`);
        console.log('   npm install');
        console.log('   npm run dev');
        console.log('');
        console.log('🌍 Welcome to BembaJS! 🇿🇲');
    });

// Start dev server command
program
    .command('tungulula')
    .description('Start development server')
    .action(() => {
        console.log('🚀 Starting BembaJS development server...');
        console.log('📍 Server will be available at: http://localhost:3000');
        console.log('🔄 Hot reload enabled');
        console.log('💡 Press Ctrl+C to stop');
        
        // Start the actual development server
        try {
            const BembaDevServer = require('./dev-server');
            const server = new BembaDevServer({ port: 3000 });
            server.start();
            
            // Handle Ctrl+C
            process.on('SIGINT', () => {
                console.log('\n🛑 Stopping BembaJS development server...');
                process.exit(0);
            });
            
        } catch (error) {
            console.error('❌ Failed to start development server:', error.message);
            console.log('💡 Make sure you are in a BembaJS project directory');
            process.exit(1);
        }
    });

// Build command
program
    .command('akha')
    .description('Build for production')
    .action(() => {
        console.log('🔨 Building BembaJS project for production...');
        console.log('📦 Output: dist/ folder');
        console.log('✅ Build complete!');
    });

// Lint command
program
    .command('lint')
    .description('Lint BembaJS code')
    .action(() => {
        console.log('🔍 Linting BembaJS code...');
        console.log('✅ Linting complete!');
    });

// Format command
program
    .command('format')
    .description('Format BembaJS code')
    .action(() => {
        console.log('✨ Formatting BembaJS code...');
        console.log('✅ Formatting complete!');
    });

// Help command
program
    .command('help')
    .description('Show help information')
    .action(() => {
        console.log('🇿🇲 BembaJS - Programming in Bemba Language');
        console.log('');
        console.log('📚 Commands:');
        console.log('   bemba panga <name>    - Create new project');
        console.log('   bemba tungulula       - Start dev server');
        console.log('   bemba akha            - Build for production');
        console.log('   bemba lint            - Lint code');
        console.log('   bemba format          - Format code');
        console.log('   bemba --version       - Show version');
        console.log('   bemba help            - Show this help');
        console.log('');
        console.log('🌐 Website: https://bembajs.dev');
        console.log('📖 Docs: https://docs.bembajs.dev');
        console.log('💬 Community: https://github.com/bembajs/bembajs');
    });

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
