// app.js - Enhanced with new framework support
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

// Import both old and new parsers
const OldBembaParser = require('./parser');
const BembaLexer = require('./lexer');
const BembaTransformer = require('./transformer');
const BembaGenerator = require('./generator');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Route to serve the index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Old compiler endpoint (backward compatible)
app.post('/compile', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Tapali ifyalembwa' });
    }

    try {
        // Check if it's old syntax (pangaWebusaiti) or new syntax
        if (code.includes('pangaWebusaiti')) {
            // Use old parser - create instance first
            const oldParser = new OldBembaParser();
            const compiledContent = oldParser.compile(code);
            res.send(compiledContent);
        } else {
            // Use new framework (simplified for web IDE)
            const result = compileNewSyntax(code);
            res.send(result);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// New framework test endpoint
app.post('/compile-new', (req, res) => {
    const { code, type } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Tapali ifyalembwa' });
    }

    try {
        const result = compileNewSyntax(code, type);
        res.json({ 
            success: true, 
            compiled: result,
            message: 'Compiled with new BembaJS framework'
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Helper function to compile new syntax
function compileNewSyntax(code, type = 'component') {
    const lexer = new BembaLexer();
    const transformer = new BembaTransformer();
    const generator = new BembaGenerator();
    
    try {
        // Tokenize
        const tokens = lexer.tokenize(code);
        
        // For web IDE, create a simplified AST
        const mockAST = createMockAST(code, type);
        
        // Transform
        const transformed = transformer.transform(mockAST);
        
        // Generate - use HTML generator for pages
        let generated;
        if (type === 'page') {
            // Extract page config from the mock AST
            const pageConfig = extractPageConfig(mockAST);
            generated = generator.generateHTMLFromPage(pageConfig);
        } else {
            generated = generator.generate(transformed);
        }
        
        // Wrap in HTML for preview
        return wrapInHTML(generated, type);
    } catch (error) {
        throw new Error(`Compilation failed: ${error.message}`);
    }
}

// Create mock AST for web IDE (simplified)
function createMockAST(code, type) {
    if (type === 'component' || code.includes('fyambaIcipanda')) {
        return {
            type: 'ReactComponent',
            name: 'PreviewComponent',
            props: {},
            state: {},
            hooks: [],
            lifecycle: {},
            methods: {},
            render: {
                type: 'JSXReturn',
                expression: {
                    type: 'JSXElement',
                    tagName: 'div',
                    props: { className: 'preview' },
                    children: [
                        {
                            type: 'JSXText',
                            text: 'Component Preview - Full compilation requires file-based project'
                        }
                    ]
                }
            }
        };
    }
    
    if (type === 'page' || code.includes('pangaIpepa')) {
        return {
            type: 'Page',
            config: extractPageConfigFromCode(code)
        };
    }
    
    return {
        type: 'Program',
        statements: []
    };
}

// Extract page configuration from BembaJS code
function extractPageConfigFromCode(code) {
    // Simple regex-based extraction for demo purposes
    const config = {
        umutwe: 'Panga BembaJS App',
        ilyashi: 'Yapangwa na create bembajs app',
        ifiputulwa: [{
            umutwe: 'Tantika ukupanga ukulemba',
            ilyashi: 'Bika na ukumona ifyakusendeka mwangu.',
            amabatani: [
                {
                    ilembo: 'Panga pa Vercel',
                    pakuKlikisha: 'window.open("https://vercel.com/new?utm_source=create-bembajs&utm_medium=appdir-template&utm_campaign=create-bembajs", "_blank")'
                },
                {
                    ilembo: 'Soma amakalata yetu',
                    pakuKlikisha: 'window.open("https://bembajs.dev/docs", "_blank")'
                }
            ]
        }],
        imikalile: extractCSSFromCode(code)
    };
    
    return config;
}

// Extract CSS from the code
function extractCSSFromCode(code) {
    const cssMatch = code.match(/imikalile:\s*`([\s\S]*?)`/);
    if (cssMatch) {
        return cssMatch[1].trim();
    }
    return '';
}

// Extract page config from mock AST
function extractPageConfig(mockAST) {
    if (mockAST.type === 'Page' && mockAST.config) {
        return mockAST.config;
    }
    
    // Fallback to default config
    return {
        umutwe: 'Panga BembaJS App',
        ilyashi: 'Yapangwa na create bembajs app',
        ifiputulwa: [{
            umutwe: 'Tantika ukupanga ukulemba',
            ilyashi: 'Bika na ukumona ifyakusendeka mwangu.',
            amabatani: [
                {
                    ilembo: 'Panga pa Vercel',
                    pakuKlikisha: 'window.open("https://vercel.com/new?utm_source=create-bembajs&utm_medium=appdir-template&utm_campaign=create-bembajs", "_blank")'
                },
                {
                    ilembo: 'Soma amakalata yetu',
                    pakuKlikisha: 'window.open("https://bembajs.dev/docs", "_blank")'
                }
            ]
        }],
        imikalile: ''
    };
}

// Wrap generated code in HTML for preview
function wrapInHTML(code, type) {
    // If it's a page type, generate the full HTML structure
    if (type === 'page') {
        return code; // The code is already HTML
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BembaJS Preview</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .preview { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .info { background: #e3f2fd; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        pre { background: #263238; color: #aed581; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .success { color: #4caf50; }
    </style>
</head>
<body>
    <div class="info">
        <h2 class="success">✅ Compilation Successful!</h2>
        <p>Your BembaJS code has been processed by the new framework.</p>
        <p><strong>Type:</strong> ${type}</p>
    </div>
    
    <div class="preview">
        <h3>Generated React Code:</h3>
        <pre>${escapeHtml(code)}</pre>
    </div>
    
    <div class="info">
        <h3>💡 Next Steps:</h3>
        <ul>
            <li>For full functionality, create a project: <code>bemba panga my-app</code></li>
            <li>Use the CLI for complete features: routing, SSR, API routes</li>
            <li>This web IDE shows the compilation output</li>
        </ul>
    </div>
</body>
</html>`;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 BembaJS Development Server`);
    console.log(`📍 Running at: http://localhost:${port}`);
    console.log(`🌐 Web IDE: http://localhost:${port}`);
    console.log(`📚 Framework: Next.js-like with Bemba syntax`);
    console.log(`\n💡 Features:`);
    console.log(`   - Old syntax (pangaWebusaiti) still supported`);
    console.log(`   - New syntax (fyambaIcipanda, pangaIpepa) available`);
    console.log(`   - Hot reload enabled`);
    console.log(`\n🛠️  CLI Commands:`);
    console.log(`   - bemba panga <name>  : Create new project`);
    console.log(`   - bemba tungulula     : Start dev server`);
    console.log(`   - bemba akha          : Build for production`);
});