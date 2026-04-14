/**
 * BembaJS Project File System Operations
 */

const fs = require('fs');
const path = require('path');
const BEMBAJS_LOGO_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAQAAAACQBAMAAAAVTaiiAAAAMFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABaPxwLAAAAD3RSTlMA3yCAQMAQ759gUDBwkK/koHcMAAABqElEQVR42u3YvUozURAG4Dcnuvoln3w/hSAWuxaCnQFFywRsBYM34IIXoChY2ETtBMGAjY2od2DuwMLCW/AqdP3HwvFEg6ybbUSYAX0fmOY0Oww77J4XREREREREREREREREXxOcX8Sw1BIZhiHXEHmIYKdfvDrs9Im3DDt/xLvCJ3y3CQyItwE7LhRJIhgaEZmHqZkzGCo14fWcwErhMQLcwiCsVKUCFOUGRgJJ4IUJrIw9wZsz3IMavDJ+qmIFHYunsDCeHOFVOVyBhV3pNNAjdzDgwkd0XCYxDBTfBz8yBRMxLAXWzfRvIWW0Dm2H0sS7UuMW2sL0hcQ11Pcg2L1BSvU5grJSHSm9NfwwLkZGEEFTYQgZx4PQVJUjfPBL98/QSZK3loqmn5AxtwpNromM3xH0zE4ix8wklIyK/EeXVvtUhQvbyVReXqXzQegkU7mnFWgoiLeWGxf9hYK3R11jbyJK17heXtUn3j0WpJauJb0JDIhXzzbQq5dXtd93qWHz34cqi15e1RJZR5djxdz6YCdGF7e/HYOIiIiIiIiIiIiIiOjzXgA1X7Msl1OuJQAAAABJRU5ErkJggg==';

/**
 * Create a new BembaJS project
 */
async function createProject(name, options = {}) {
    const projectPath = path.resolve(name);
    
    if (fs.existsSync(projectPath)) {
        throw new Error(`Directory ${name} already exists`);
    }
    
    // Create project directory
    fs.mkdirSync(projectPath, { recursive: true });
    
    // Scaffold project structure
    await scaffold(projectPath, options);
    
    return { success: true, path: projectPath };
}

/**
 * Scaffold project structure
 */
async function scaffold(projectPath, options = {}) {
    const folders = [
        'amapeji',
        'amashinda',
        'ifikopo',
        'maapi',
        'imikalile',
        'mafungulo',
        'mahooks',
        'macontext',
        'mautils'
    ];
    
    // Create folder structure
    for (const folder of folders) {
        const folderPath = path.join(projectPath, folder);
        fs.mkdirSync(folderPath, { recursive: true });
    }

    writeBoilerTemplateFiles(projectPath);
    
    return { success: true };
}

function writeBoilerTemplateFiles(projectPath) {
    const appDir = path.join(projectPath, 'amapeji', 'app');
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(
        path.join(appDir, 'page.bemba'),
        `pangaIpepa('Home', {
  ukwisulula: nokuti() {
    bwelela (
      <icipandwa style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <icipandwa style={{ width: '100%', maxWidth: '42rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <icipandwa style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <img src="/amashinda/bembajs-logo.png" alt="BembaJS logo" style={{ width: '72px', height: '72px', borderRadius: '14px' }} />
          </icipandwa>
          <icipandwa>
            <ukulondolola style={{ color: '#a1a1aa', fontSize: '0.875rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
              bembajs v1.0.0
            </ukulondolola>
            <umutwe_ukulu style={{ marginTop: '0.75rem', fontSize: 'clamp(2.6rem, 6vw, 4rem)', lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 700 }}>
              Build with JavaScript
            </umutwe_ukulu>
          </icipandwa>
          <icipandwa>
            <umutwe_ukalamba style={{ color: '#a1a1aa', fontWeight: 300, fontSize: 'clamp(1.15rem, 2.3vw, 1.55rem)' }}>
              A modern JavaScript framework for web development
            </umutwe_ukalamba>
            <ukulondolola style={{ color: '#a1a1aa', maxWidth: '40rem', margin: '1rem auto 0', lineHeight: 1.7 }}>
              Fast, simple, and powerful. Built for developers who value simplicity and performance. Get started in seconds with zero configuration.
            </ukulondolola>
          </icipandwa>
          <icipandwa style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', paddingTop: '0.25rem' }}>
            <a href="#" style={{ padding: '0.75rem 2rem', borderRadius: '0.65rem', background: '#f5f5f5', color: '#0a0a0a', fontWeight: 500, textDecoration: 'none' }}>
              Get Started
            </a>
            <a href="https://github.com/bembajs/bembajs/blob/main/README.md" style={{ padding: '0.75rem 2rem', borderRadius: '0.65rem', border: '1px solid #2a2a2a', color: '#e4e4e7', fontWeight: 500, textDecoration: 'none' }}>
              Documentation
            </a>
          </icipandwa>
        </icipandwa>
      </icipandwa>
    );
  }
});
`,
        'utf8'
    );

    fs.writeFileSync(
        path.join(projectPath, 'amashinda', 'bembajs-logo.png'),
        Buffer.from(BEMBAJS_LOGO_PNG_BASE64, 'base64')
    );
}

/**
 * Copy template to destination
 */
async function copyTemplate(template, destination) {
    const templatePath = path.join(__dirname, '../../templates', template);
    
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template ${template} not found`);
    }
    
    copyDirectory(templatePath, destination);
    
    return { success: true };
}

/**
 * Recursively copy directory
 */
function copyDirectory(src, dest) {
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

module.exports = {
    createProject,
    scaffold,
    copyTemplate
};

