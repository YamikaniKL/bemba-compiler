// Pisha CLI - Build tool for BembaJS
import { createServer, build, preview } from 'vite';
import { bembaPlugin } from './plugin.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Start development server
 */
export async function dev(options = {}) {
  const port = options.port || 3000;
  const open = options.open !== false;
  
  console.log('🔥 [Pisha] Starting development server...');
  
  try {
    const server = await createServer({
      plugins: [bembaPlugin()],
      server: {
        port,
        open,
        hmr: true
      },
      root: process.cwd()
    });
    
    await server.listen();
    
    const url = `http://localhost:${port}`;
    console.log(`✨ [Pisha] Server running at ${url}`);
    console.log(`📝 [Pisha] Ready to compile .bemba files!`);
    
    return server;
  } catch (error) {
    console.error('❌ [Pisha] Failed to start dev server:', error);
    process.exit(1);
  }
}

/**
 * Build for production
 */
export async function buildProject(options = {}) {
  const outDir = options.outDir || 'dist';
  
  console.log('🏗️  [Pisha] Building for production...');
  
  try {
    await build({
      plugins: [bembaPlugin()],
      build: {
        outDir,
        emptyOutDir: true,
        minify: true,
        sourcemap: true
      },
      root: process.cwd()
    });
    
    console.log(`✅ [Pisha] Build complete! Output: ./${outDir}`);
  } catch (error) {
    console.error('❌ [Pisha] Build failed:', error);
    process.exit(1);
  }
}

/**
 * Preview production build
 */
export async function previewProject(options = {}) {
  const port = options.port || 4173;
  const outDir = options.outDir || 'dist';
  
  console.log('👀 [Pisha] Starting preview server...');
  
  try {
    const server = await preview({
      preview: {
        port,
        open: true
      },
      build: {
        outDir
      },
      root: process.cwd()
    });
    
    await server.listen();
    
    const url = `http://localhost:${port}`;
    console.log(`✨ [Pisha] Preview server running at ${url}`);
    
    return server;
  } catch (error) {
    console.error('❌ [Pisha] Preview failed:', error);
    process.exit(1);
  }
}

/**
 * Parse CLI arguments and execute command
 */
export function runCLI() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Parse options
  const options = {};
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    options[key] = value === 'true' ? true : value === 'false' ? false : value;
  }
  
  switch (command) {
    case 'dev':
      dev(options);
      break;
    
    case 'build':
      buildProject(options);
      break;
    
    case 'preview':
      previewProject(options);
      break;
    
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    
    default:
      console.log(`❌ [Pisha] Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
🔥 Pisha - The build tool for BembaJS

Usage:
  pisha <command> [options]

Commands:
  dev       Start development server
  build     Build for production
  preview   Preview production build
  help      Show this help message

Options:
  --port <number>    Port number (default: 3000 for dev, 4173 for preview)
  --open <boolean>   Open browser automatically (default: true)
  --outDir <path>    Output directory for build (default: dist)

Examples:
  pisha dev
  pisha dev --port 8080
  pisha build
  pisha build --outDir build
  pisha preview
  pisha preview --port 5000

Documentation: https://github.com/YamikaniKL/bemba-compiler
  `);
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI();
}

