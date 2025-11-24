# Quick Start Implementation Guide

## 🚀 Get Started with Top Priority Features

This guide helps you implement the most critical features quickly.

---

## 1. Testing Framework Setup (Start Here!)

### Step 1: Install Dependencies

```bash
# From root directory
pnpm add -D -w vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

### Step 2: Create Test Configuration

Create `vitest.config.js` in root:

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});
```

### Step 3: Create First Test

Create `packages/bembajs-core/tests/lexer.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { BembaLexer } from '../dist/lexer.js';

describe('BembaLexer', () => {
  it('should tokenize basic Bemba code', () => {
    const lexer = new BembaLexer();
    const code = `fyambaIcipanda('Test', { umutwe: 'Hello' });`;
    const tokens = lexer.tokenize(code);
    
    expect(tokens).toBeDefined();
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('should handle component syntax', () => {
    const lexer = new BembaLexer();
    const code = `pangaIpepa('Home', { ilyashi: 'Welcome' });`;
    const tokens = lexer.tokenize(code);
    
    expect(tokens).toBeDefined();
  });
});
```

### Step 4: Add Test Scripts

Update `packages/bembajs-core/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Step 5: Run Tests

```bash
cd packages/bembajs-core
pnpm test
```

---

## 2. Implement `bemba lint` Command

### Step 1: Create Linter

Create `packages/bembajs-core/src/linter.js`:

```javascript
class BembaLinter {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  lint(code, filename = 'unknown') {
    this.errors = [];
    this.warnings = [];

    // Check for common issues
    this.checkSyntax(code, filename);
    this.checkBestPractices(code, filename);
    this.checkNamingConventions(code, filename);

    return {
      errors: this.errors,
      warnings: this.warnings,
      hasErrors: this.errors.length > 0,
      hasWarnings: this.warnings.length > 0
    };
  }

  checkSyntax(code, filename) {
    // Check for unclosed brackets
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      this.errors.push({
        line: 1,
        column: 1,
        message: 'Unclosed braces detected',
        filename
      });
    }

    // Check for required keywords
    if (code.includes('fyambaIcipanda') && !code.includes('ifiputulwa')) {
      this.warnings.push({
        line: 1,
        message: 'Component should have ifiputulwa property',
        filename
      });
    }
  }

  checkBestPractices(code, filename) {
    // Check for console.log (should use londolola)
    if (code.includes('console.log')) {
      this.warnings.push({
        line: 1,
        message: 'Use londolola() instead of console.log()',
        filename
      });
    }
  }

  checkNamingConventions(code, filename) {
    // Check component names start with uppercase
    const componentMatches = code.match(/fyambaIcipanda\s*\(\s*['"]([^'"]+)['"]/g);
    if (componentMatches) {
      componentMatches.forEach(match => {
        const nameMatch = match.match(/['"]([^'"]+)['"]/);
        if (nameMatch && nameMatch[1] && nameMatch[1][0] !== nameMatch[1][0].toUpperCase()) {
          this.warnings.push({
            line: 1,
            message: `Component name "${nameMatch[1]}" should start with uppercase`,
            filename
          });
        }
      });
    }
  }
}

module.exports = BembaLinter;
```

### Step 2: Update CLI

Update `packages/bembajs/dist/cli.js`:

```javascript
// Replace the lint command
program
    .command('lint [files...]')
    .description('Lint BembaJS code')
    .option('-f, --fix', 'Auto-fix issues')
    .action(async (files, options) => {
        const BembaLinter = require('../dist/linter');
        const linter = new BembaLinter();
        const fs = require('fs');
        const path = require('path');
        const glob = require('glob');

        // Find .bemba files
        const bembaFiles = files.length > 0 
            ? files 
            : glob.sync('**/*.bemba', { ignore: ['node_modules/**'] });

        let totalErrors = 0;
        let totalWarnings = 0;

        for (const file of bembaFiles) {
            if (!fs.existsSync(file)) continue;
            
            const code = fs.readFileSync(file, 'utf-8');
            const result = linter.lint(code, file);

            if (result.hasErrors || result.hasWarnings) {
                console.log(`\n📄 ${file}`);
                
                result.errors.forEach(error => {
                    console.log(`  ❌ Error: ${error.message} (line ${error.line})`);
                    totalErrors++;
                });
                
                result.warnings.forEach(warning => {
                    console.log(`  ⚠️  Warning: ${warning.message} (line ${warning.line})`);
                    totalWarnings++;
                });
            }
        }

        if (totalErrors === 0 && totalWarnings === 0) {
            console.log('✅ No linting issues found!');
        } else {
            console.log(`\n📊 Summary: ${totalErrors} errors, ${totalWarnings} warnings`);
            process.exit(totalErrors > 0 ? 1 : 0);
        }
    });
```

### Step 3: Build and Test

```bash
cd packages/bembajs-core
pnpm build
cd ../bembajs
pnpm build
bemba lint examples/*.bemba
```

---

## 3. Implement `bemba format` Command

### Step 1: Create Formatter

Create `packages/bembajs-core/src/formatter.js`:

```javascript
class BembaFormatter {
  format(code) {
    let formatted = code;

    // Normalize line endings
    formatted = formatted.replace(/\r\n/g, '\n');

    // Remove extra blank lines (max 2 consecutive)
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    // Fix indentation
    formatted = this.fixIndentation(formatted);

    // Add spaces around operators
    formatted = formatted.replace(/([^=!<>])=([^=])/g, '$1 = $2');
    formatted = formatted.replace(/([^=!<>])==([^=])/g, '$1 == $2');
    formatted = formatted.replace(/([^=!<>])!=([^=])/g, '$1 != $2');

    // Fix spacing in function calls
    formatted = formatted.replace(/\(\s+/g, '(');
    formatted = formatted.replace(/\s+\)/g, ')');

    // Ensure semicolons
    formatted = formatted.replace(/([^;}])\n/g, '$1;\n');

    return formatted;
  }

  fixIndentation(code) {
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentSize = 2;

    return lines.map(line => {
      const trimmed = line.trim();
      
      // Decrease indent for closing braces
      if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indented = ' '.repeat(indentLevel * indentSize) + trimmed;

      // Increase indent for opening braces
      if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
        indentLevel++;
      }

      return indented;
    }).join('\n');
  }
}

module.exports = BembaFormatter;
```

### Step 2: Update CLI

Add to `packages/bembajs/dist/cli.js`:

```javascript
program
    .command('format [files...]')
    .description('Format BembaJS code')
    .option('-w, --write', 'Write formatted code to files')
    .action(async (files, options) => {
        const BembaFormatter = require('../dist/formatter');
        const formatter = new BembaFormatter();
        const fs = require('fs');
        const glob = require('glob');

        const bembaFiles = files.length > 0 
            ? files 
            : glob.sync('**/*.bemba', { ignore: ['node_modules/**'] });

        for (const file of bembaFiles) {
            if (!fs.existsSync(file)) continue;
            
            const code = fs.readFileSync(file, 'utf-8');
            const formatted = formatter.format(code);

            if (options.write) {
                fs.writeFileSync(file, formatted, 'utf-8');
                console.log(`✅ Formatted: ${file}`);
            } else {
                console.log(`\n📄 ${file}:`);
                console.log(formatted);
            }
        }

        if (!options.write) {
            console.log('\n💡 Use --write to save changes');
        }
    });
```

---

## 4. Complete `bemba akha` Build Command

### Step 1: Create Builder

Create `packages/bembajs/src/builder.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { compile } = require('bembajs-core');
const glob = require('glob');

class BembaBuilder {
  constructor(options = {}) {
    this.outputDir = options.output || './dist';
    this.sourceDir = options.source || './';
  }

  async build() {
    console.log('🔨 Building BembaJS project...');

    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Find all .bemba files
    const bembaFiles = glob.sync('**/*.bemba', {
      cwd: this.sourceDir,
      ignore: ['node_modules/**', 'dist/**']
    });

    let successCount = 0;
    let errorCount = 0;

    for (const file of bembaFiles) {
      try {
        const filePath = path.join(this.sourceDir, file);
        const code = fs.readFileSync(filePath, 'utf-8');
        
        // Determine file type
        const type = this.determineType(file);
        
        // Compile
        const result = compile(code, { type });
        
        if (result.success !== false) {
          // Write compiled output
          const outputPath = path.join(
            this.outputDir,
            file.replace('.bemba', '.js')
          );
          
          const outputDir = path.dirname(outputPath);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          
          fs.writeFileSync(outputPath, result.code || result, 'utf-8');
          console.log(`✅ Built: ${file}`);
          successCount++;
        } else {
          console.error(`❌ Error in ${file}: ${result.error}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error building ${file}:`, error.message);
        errorCount++;
      }
    }

    // Copy static assets
    this.copyStaticAssets();

    console.log(`\n📊 Build complete: ${successCount} succeeded, ${errorCount} failed`);
    
    return { success: errorCount === 0, successCount, errorCount };
  }

  determineType(filePath) {
    if (filePath.includes('amapeji')) return 'page';
    if (filePath.includes('maapi') || filePath.includes('mafungulo')) return 'api';
    if (filePath.includes('ifikopo')) return 'component';
    return 'component';
  }

  copyStaticAssets() {
    const staticDirs = ['maungu', 'amashinda', 'public'];
    
    for (const dir of staticDirs) {
      const sourcePath = path.join(this.sourceDir, dir);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(this.outputDir, dir);
        this.copyDirectory(sourcePath, destPath);
        console.log(`📁 Copied: ${dir}/`);
      }
    }
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

module.exports = BembaBuilder;
```

### Step 2: Update CLI

Update `packages/bembajs/dist/cli.js`:

```javascript
program
    .command('akha')
    .description('Build for production')
    .option('-o, --output <dir>', 'Output directory', 'dist')
    .action(async (options) => {
        const BembaBuilder = require('../dist/builder');
        const builder = new BembaBuilder({ output: options.output });
        
        const result = await builder.build();
        
        if (result.success) {
            console.log('✅ Production build complete!');
            process.exit(0);
        } else {
            console.error('❌ Build failed');
            process.exit(1);
        }
    });
```

---

## 5. Add TypeScript Definitions

### Step 1: Create Type Definitions

Create `packages/bembajs-core/dist/index.d.ts`:

```typescript
export interface CompileOptions {
  type?: 'component' | 'page' | 'api';
  minify?: boolean;
}

export interface CompileResult {
  success: boolean;
  code?: string;
  error?: string;
  stack?: string;
}

export declare function compile(
  code: string,
  options?: CompileOptions
): CompileResult;

export declare function parse(code: string): any;
export declare function transform(ast: any): any;
export declare function generate(ast: any): string;

export class BembaLexer {
  tokenize(code: string): any[];
}

export class BembaParser {
  parse(tokens: any[]): any;
  compile(code: string, options?: CompileOptions): CompileResult;
}

export class BembaTransformer {
  transform(ast: any): any;
}

export class BembaGenerator {
  generate(ast: any): string;
}

export const BEMBA_KEYWORDS: string[];
export const BEMBA_FOLDERS: {
  pages: string;
  components: string;
  api: string;
  static: string;
};
```

### Step 2: Update package.json

Add to `packages/bembajs-core/package.json`:

```json
{
  "types": "./dist/index.d.ts"
}
```

---

## 🎯 Next Steps

1. **Run tests** - Make sure everything works
2. **Test CLI commands** - Try them on real projects
3. **Write more tests** - Cover edge cases
4. **Update documentation** - Document new features
5. **Get feedback** - Test with real users

---

## 📝 Notes

- Start with testing - it's the foundation
- Implement one feature at a time
- Test as you build
- Update docs as you go

Good luck! 🚀

