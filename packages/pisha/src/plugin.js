// Vite plugin for .bemba files
import { BembaParser } from 'bembajs/src/parser.js';
import { BembaTransformer } from 'bembajs/src/transformer.js';
import { BembaGenerator } from 'bembajs/src/generator.js';

/**
 * Vite plugin to transform .bemba files to JSX
 */
export function bembaPlugin(options = {}) {
  return {
    name: 'vite-plugin-bemba',
    
    // Mark .bemba files as valid modules
    resolveId(id) {
      if (id.endsWith('.bemba')) {
        return id;
      }
      return null;
    },
    
    // Transform .bemba files to JSX
    async transform(code, id) {
      if (!id.endsWith('.bemba')) {
        return null;
      }
      
      try {
        console.log(`[Pisha] Compiling: ${id}`);
        
        // Parse BembaJS code
        const parser = new BembaParser();
        const ast = parser.parse(code);
        
        // Transform to React-compatible AST
        const transformer = new BembaTransformer();
        const reactAst = transformer.transform(ast);
        
        // Generate JSX code
        const generator = new BembaGenerator();
        const jsx = generator.generate(reactAst);
        
        console.log(`[Pisha] Compiled successfully: ${id}`);
        
        return {
          code: jsx,
          map: null
        };
      } catch (error) {
        console.error(`[Pisha] Error compiling ${id}:`, error);
        throw error;
      }
    },
    
    // Hot reload support for .bemba files
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.bemba')) {
        console.log(`[Pisha] Hot reloading: ${file}`);
        server.ws.send({
          type: 'full-reload',
          path: '*'
        });
      }
    },
    
    // Configure Vite to handle .bemba files
    config() {
      return {
        optimizeDeps: {
          include: ['react', 'react-dom']
        },
        resolve: {
          extensions: ['.bemba', '.js', '.jsx', '.ts', '.tsx']
        }
      };
    }
  };
}

export default bembaPlugin;

