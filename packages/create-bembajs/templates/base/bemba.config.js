// BembaJS Configuration
module.exports = {
  // Project settings
  name: 'bemba-app',
  version: '1.0.0',
  
  // Framework settings
  framework: 'nextjs-like',
  
  // Folder structure (using Bemba names)
  folders: {
    pages: 'amapeji',           // Pages folder
    components: 'ifikopo',      // Components folder
    styles: 'imikalile',        // Styles folder
    assets: 'mafungulo',        // Assets folder
    api: 'maapi',              // API routes folder
    utils: 'mautils',          // Utilities folder
    hooks: 'mahooks',          // Custom hooks folder
    context: 'macontext'       // Context providers folder
  },
  
  // Compilation settings
  compiler: {
    target: 'react',
    output: 'dist',
    sourceMaps: true,
    minify: true,
    optimize: true
  },
  
  // Development settings
  dev: {
    port: 3000,
    hotReload: true,
    openBrowser: true,
    apiPort: 3001
  },
  
  // Build settings
  build: {
    output: 'dist',
    static: 'out',
    ssg: true,
    ssr: true,
    optimize: true
  },
  
  // Features
  features: {
    routing: true,
    ssr: true,
    ssg: true,
    apiRoutes: true,
    components: true,
    hooks: true,
    context: true,
    styling: true
  }
};
