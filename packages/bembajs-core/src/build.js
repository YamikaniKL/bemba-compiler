// Production build system with SSG and optimization for BembaJS
const fs = require('fs');
const path = require('path');
const { BEMBA_FOLDERS } = require('./constants');
const BembaParser = require('./parser');
const BembaTransformer = require('./transformer');
const BembaGenerator = require('./generator');
const BembaRouter = require('./router');

class BembaBuildSystem {
    constructor(options = {}) {
        this.projectRoot = process.cwd();
        this.outputDir = options.outputDir || 'dist';
        this.static = options.static || false;
        this.analyze = options.analyze || false;
        this.minify = options.minify !== false;
        
        // Framework instances
        this.parser = new BembaParser();
        this.transformer = new BembaTransformer();
        this.generator = new BembaGenerator();
        this.router = new BembaRouter(this.projectRoot);
        
        // Build artifacts
        this.buildArtifacts = {
            pages: new Map(),
            components: new Map(),
            apiRoutes: new Map(),
            staticFiles: new Map(),
            manifest: null
        };
        
        // Statistics
        this.buildStats = {
            startTime: null,
            endTime: null,
            filesProcessed: 0,
            errors: [],
            warnings: []
        };
    }
    
    async build() {
        console.log('🏗️  Starting BembaJS production build...');
        this.buildStats.startTime = Date.now();
        
        try {
            // Clean output directory
            await this.cleanOutputDir();
            
            // Parse entire project
            const project = await this.parseProject();
            
            // Transform to React-compatible AST
            const transformedProject = this.transformer.transformProject(project);
            
            // Generate React code
            const generatedFiles = this.generator.generateProject(transformedProject);
            
            // Build pages
            await this.buildPages(generatedFiles);
            
            // Build components
            await this.buildComponents(generatedFiles);
            
            // Build API routes
            await this.buildApiRoutes(generatedFiles);
            
            // Copy static files
            await this.copyStaticFiles();
            
            // Generate build manifest
            await this.generateBuildManifest();
            
            // Generate Next.js configuration
            await this.generateNextConfig();
            
            // Generate package.json for output
            await this.generateOutputPackageJson();
            
            // Build statistics
            this.buildStats.endTime = Date.now();
            this.printBuildStats();
            
            console.log('✅ Build completed successfully!');
            
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            this.buildStats.errors.push(error.message);
            process.exit(1);
        }
    }
    
    async export() {
        console.log('📦 Exporting static site...');
        this.static = true;
        await this.build();
    }
    
    async cleanOutputDir() {
        const outputPath = path.join(this.projectRoot, this.outputDir);
        
        if (fs.existsSync(outputPath)) {
            fs.rmSync(outputPath, { recursive: true, force: true });
        }
        
        fs.mkdirSync(outputPath, { recursive: true });
        console.log(`🧹 Cleaned output directory: ${this.outputDir}`);
    }
    
    async parseProject() {
        console.log('📖 Parsing project files...');
        
        const project = this.parser.parseProject(this.projectRoot);
        
        if (project.errors.length > 0) {
            console.warn('⚠️  Parsing warnings:');
            project.errors.forEach(error => console.warn(`   ${error}`));
        }
        
        console.log(`📄 Parsed ${project.modules.size} files`);
        return project;
    }
    
    async buildPages(generatedFiles) {
        console.log('📄 Building pages...');
        
        const pagesDir = path.join(this.outputDir, 'pages');
        fs.mkdirSync(pagesDir, { recursive: true });
        
        for (const [filePath, code] of generatedFiles) {
            if (filePath.includes(BEMBA_FOLDERS.PAGES)) {
                const outputPath = this.getOutputPath(filePath, pagesDir);
                const dir = path.dirname(outputPath);
                
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                fs.writeFileSync(outputPath, code);
                this.buildArtifacts.pages.set(filePath, outputPath);
                this.buildStats.filesProcessed++;
            }
        }
        
        console.log(`✅ Built ${this.buildArtifacts.pages.size} pages`);
    }
    
    async buildComponents(generatedFiles) {
        console.log('🧩 Building components...');
        
        const componentsDir = path.join(this.outputDir, 'components');
        fs.mkdirSync(componentsDir, { recursive: true });
        
        for (const [filePath, code] of generatedFiles) {
            if (filePath.includes(BEMBA_FOLDERS.COMPONENTS)) {
                const outputPath = this.getOutputPath(filePath, componentsDir);
                const dir = path.dirname(outputPath);
                
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                fs.writeFileSync(outputPath, code);
                this.buildArtifacts.components.set(filePath, outputPath);
                this.buildStats.filesProcessed++;
            }
        }
        
        console.log(`✅ Built ${this.buildArtifacts.components.size} components`);
    }
    
    async buildApiRoutes(generatedFiles) {
        console.log('🔌 Building API routes...');
        
        const apiDir = path.join(this.outputDir, 'pages', 'api');
        fs.mkdirSync(apiDir, { recursive: true });
        
        for (const [filePath, code] of generatedFiles) {
            if (filePath.includes(BEMBA_FOLDERS.API)) {
                const outputPath = this.getOutputPath(filePath, apiDir);
                const dir = path.dirname(outputPath);
                
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                fs.writeFileSync(outputPath, code);
                this.buildArtifacts.apiRoutes.set(filePath, outputPath);
                this.buildStats.filesProcessed++;
            }
        }
        
        console.log(`✅ Built ${this.buildArtifacts.apiRoutes.size} API routes`);
    }
    
    async copyStaticFiles() {
        console.log('📁 Copying static files...');
        
        const publicDir = path.join(this.projectRoot, BEMBA_FOLDERS.PUBLIC);
        const outputPublicDir = path.join(this.outputDir, 'public');
        
        if (fs.existsSync(publicDir)) {
            this.copyDirectory(publicDir, outputPublicDir);
        }
        
        // Copy styles
        const stylesDir = path.join(this.projectRoot, BEMBA_FOLDERS.STYLES);
        const outputStylesDir = path.join(this.outputDir, 'styles');
        
        if (fs.existsSync(stylesDir)) {
            this.copyDirectory(stylesDir, outputStylesDir);
        }
        
        console.log('✅ Static files copied');
    }
    
    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const items = fs.readdirSync(src);
        
        for (const item of items) {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            const stat = fs.statSync(srcPath);
            
            if (stat.isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
                this.buildArtifacts.staticFiles.set(srcPath, destPath);
            }
        }
    }
    
    async generateBuildManifest() {
        console.log('📋 Generating build manifest...');
        
        const manifest = {
            version: '1.0.0',
            buildTime: new Date().toISOString(),
            static: this.static,
            pages: Object.fromEntries(this.buildArtifacts.pages),
            components: Object.fromEntries(this.buildArtifacts.components),
            apiRoutes: Object.fromEntries(this.buildArtifacts.apiRoutes),
            staticFiles: Object.fromEntries(this.buildArtifacts.staticFiles),
            routes: this.router.generateRouteManifest(),
            stats: {
                filesProcessed: this.buildStats.filesProcessed,
                buildTime: this.buildStats.endTime - this.buildStats.startTime,
                errors: this.buildStats.errors.length,
                warnings: this.buildStats.warnings.length
            }
        };
        
        const manifestPath = path.join(this.outputDir, 'build-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        
        this.buildArtifacts.manifest = manifest;
        console.log('✅ Build manifest generated');
    }
    
    async generateNextConfig() {
        console.log('⚙️  Generating Next.js configuration...');
        
        const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: ${this.minify},
  ${this.static ? 'output: "export",' : ''}
  ${this.static ? 'trailingSlash: true,' : ''}
  ${this.static ? 'images: { unoptimized: true },' : ''}
  
  // BembaJS specific configuration
  experimental: {
    // Add any experimental features here
  },
  
  // Custom webpack configuration if needed
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack configuration here
    return config;
  }
};

module.exports = nextConfig;`;
        
        const configPath = path.join(this.outputDir, 'next.config.js');
        fs.writeFileSync(configPath, nextConfig);
        
        console.log('✅ Next.js configuration generated');
    }
    
    async generateOutputPackageJson() {
        console.log('📦 Generating package.json...');
        
        const packageJson = {
            name: 'bemba-build',
            version: '1.0.0',
            private: true,
            scripts: {
                dev: 'next dev',
                build: 'next build',
                start: 'next start',
                export: 'next export'
            },
            dependencies: {
                next: '^14.0.0',
                react: '^18.0.0',
                'react-dom': '^18.0.0'
            },
            devDependencies: {
                '@types/node': '^20.0.0',
                '@types/react': '^18.0.0',
                '@types/react-dom': '^18.0.0',
                typescript: '^5.0.0'
            }
        };
        
        const packagePath = path.join(this.outputDir, 'package.json');
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        
        console.log('✅ Package.json generated');
    }
    
    getOutputPath(filePath, baseDir) {
        const relativePath = path.relative(this.projectRoot, filePath);
        const withoutExtension = relativePath.replace(/\.bemba$/, '.js');
        return path.join(baseDir, withoutExtension);
    }
    
    printBuildStats() {
        const buildTime = this.buildStats.endTime - this.buildStats.startTime;
        const buildTimeSeconds = (buildTime / 1000).toFixed(2);
        
        console.log('\n📊 Build Statistics:');
        console.log(`   ⏱️  Build time: ${buildTimeSeconds}s`);
        console.log(`   📄 Files processed: ${this.buildStats.filesProcessed}`);
        console.log(`   📄 Pages: ${this.buildArtifacts.pages.size}`);
        console.log(`   🧩 Components: ${this.buildArtifacts.components.size}`);
        console.log(`   🔌 API routes: ${this.buildArtifacts.apiRoutes.size}`);
        console.log(`   📁 Static files: ${this.buildArtifacts.staticFiles.size}`);
        
        if (this.buildStats.errors.length > 0) {
            console.log(`   ❌ Errors: ${this.buildStats.errors.length}`);
        }
        
        if (this.buildStats.warnings.length > 0) {
            console.log(`   ⚠️  Warnings: ${this.buildStats.warnings.length}`);
        }
        
        console.log(`\n📁 Output directory: ${this.outputDir}`);
        
        if (this.static) {
            console.log('📦 Static export completed');
        } else {
            console.log('🚀 Production build completed');
            console.log('   Run "npm start" to start the production server');
        }
    }
    
    // Bundle analysis
    async analyzeBundle() {
        if (!this.analyze) return;
        
        console.log('📊 Analyzing bundle...');
        
        // This would integrate with webpack-bundle-analyzer or similar
        // For now, just show basic stats
        const totalSize = this.calculateTotalSize();
        console.log(`📦 Total bundle size: ${this.formatBytes(totalSize)}`);
    }
    
    calculateTotalSize() {
        let totalSize = 0;
        
        for (const [src, dest] of this.buildArtifacts.staticFiles) {
            if (fs.existsSync(dest)) {
                const stat = fs.statSync(dest);
                totalSize += stat.size;
            }
        }
        
        return totalSize;
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Get build info
    getBuildInfo() {
        return {
            outputDir: this.outputDir,
            static: this.static,
            artifacts: this.buildArtifacts,
            stats: this.buildStats
        };
    }
}

module.exports = BembaBuildSystem;
