const fs = require('fs');

// Copy the compileBemba function from dev-server.js
function compileBemba(code) {
    try {
        // Basic Bemba to HTML compilation
        if (code.includes('pangaIpepa')) {
            // Extract page data with better regex to handle complex objects
            const pageMatch = code.match(/pangaIpepa\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{([\s\S]*)\}\s*\)/);
            if (pageMatch) {
                const pageName = pageMatch[1];
                const pageData = pageMatch[2];
                
                // Extract title and content
                const titleMatch = pageData.match(/umutwe:\s*['"`]([^'"`]+)['"`]/);
                const contentMatch = pageData.match(/ilyashi:\s*['"`]([^'"`]+)['"`]/);
                
                const title = titleMatch ? titleMatch[1] : pageName;
                const content = contentMatch ? contentMatch[1] : 'Welcome to BembaJS!';
                
                // Extract sections (ifiputulwa) - improved parsing
                let sections = '';
                const sectionsMatch = pageData.match(/ifiputulwa:\s*\[([\s\S]*?)\]/);
                if (sectionsMatch) {
                    const sectionsData = sectionsMatch[1];
                    
                    // Look for buttons directly in the sections data
                    const buttonMatches = sectionsData.match(/ilembo:\s*['"`]([^'"`]+)['"`]/g);
                    const buttonActions = sectionsData.match(/pakuKlikisha:\s*['"`]([^'"`]+)['"`]/g);
                    
                    if (buttonMatches) {
                        sections = buttonMatches.map((btn, index) => {
                            const btnText = btn.match(/['"`]([^'"`]+)['"`]/)[1];
                            const btnAction = buttonActions && buttonActions[index] ? 
                                buttonActions[index].match(/['"`]([^'"`]+)['"`]/)[1] : 
                                `alert('${btnText} clicked!')`;
                            
                            // First button is primary (Deploy now), second is secondary (Read our docs)
                            const isPrimary = index === 0;
                            const buttonClass = isPrimary ? 
                                'rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto' :
                                'rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]';
                            
                            const buttonContent = isPrimary ? 
                                `<img alt="Vercel logomark" loading="lazy" width="20" height="20" decoding="async" data-nimg="1" class="dark:invert" style="color:transparent" src="/favicon.png">${btnText}` :
                                btnText;
                            
                            return `<a class="${buttonClass}" href="#" onclick="${btnAction}; return false;" target="_blank" rel="noopener noreferrer">${buttonContent}</a>`;
                        }).join('');
                    }
                }
                
                // Extract styles (imikalile)
                let customStyles = '';
                const stylesMatch = pageData.match(/imikalile:\s*`([\s\S]*?)`/);
                if (stylesMatch) {
                    customStyles = stylesMatch[1];
                }
                
                return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/favicon.png">
    <style>
        ${customStyles}
    </style>
</head>
<body class="antialiased">
    <div class="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main class="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <img alt="BembaJS logo" width="180" height="38" decoding="async" data-nimg="1" class="dark:invert" style="color:transparent" src="/favicon.png">
            <ol class="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                <li class="mb-2 tracking-[-.01em]">Get started by editing<!-- --> <code class="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">amapeji/index.bemba</code>.</li>
                <li class="tracking-[-.01em]">Save and see your changes instantly.</li>
            </ol>
            <div class="flex gap-4 items-center flex-col sm:flex-row">
                ${sections}
            </div>
        </main>
        <footer class="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
            <a class="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://bembajs.dev/learn" target="_blank" rel="noopener noreferrer">
                <img aria-hidden="true" alt="File icon" loading="lazy" width="16" height="16" decoding="async" data-nimg="1" style="color:transparent" src="/favicon.png">
                Learn
            </a>
            <a class="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://github.com/bembajs/bembajs/tree/main/examples" target="_blank" rel="noopener noreferrer">
                <img aria-hidden="true" alt="Window icon" loading="lazy" width="16" height="16" decoding="async" data-nimg="1" style="color:transparent" src="/favicon.png">
                Examples
            </a>
            <a class="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://bembajs.dev" target="_blank" rel="noopener noreferrer">
                <img aria-hidden="true" alt="Globe icon" loading="lazy" width="16" height="16" decoding="async" data-nimg="1" style="color:transparent" src="/favicon.png">
                Go to bembajs.dev →
            </a>
        </footer>
    </div>
</body>
</html>`;
            }
        }
        
        // Fallback for other Bemba syntax
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BembaJS Page</title>
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/favicon.png">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        pre { background: #f8f9fa; padding: 20px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🇿🇲 BembaJS Page</h1>
        <p>Your Bemba code has been compiled successfully!</p>
        <pre>${code}</pre>
    </div>
</body>
</html>`;
    } catch (error) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BembaJS Error</title>
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/favicon.png">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #dc3545; }
        pre { background: #f8f9fa; padding: 20px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ BembaJS Compilation Error</h1>
        <p>There was an error compiling your Bemba code:</p>
        <pre>${error.message}</pre>
    </div>
</body>
</html>`;
    }
}

// Test the compilation
const code = fs.readFileSync('test-grid-layout.bemba', 'utf8');
const html = compileBemba(code);
console.log(html);
