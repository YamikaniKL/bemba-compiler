// Pisha default configuration
export default {
  // Vite configuration
  vite: {
    resolve: {
      alias: {
        '@': './src',
        '@ifikopo': './ifikopo',
        '@amapeji': './amapeji',
        '@mafungulo': './mafungulo',
        '@amashinda': './amashinda'
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  },
  
  // BembaJS configuration
  bemba: {
    // UI library wrappers
    wrappers: {
      shadcn: true,
      mui: false,
      chakra: false,
      custom: []
    },
    
    // CSS frameworks
    cssFrameworks: ['tailwind'],
    
    // Output format
    outputFormat: 'jsx',
    
    // Source maps
    sourceMaps: true
  },
  
  // Development server
  server: {
    port: 3000,
    open: true,
    hmr: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: true
  },
  
  // Preview server
  preview: {
    port: 4173,
    open: true
  }
};

