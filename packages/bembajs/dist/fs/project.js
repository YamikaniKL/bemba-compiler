/**
 * BembaJS Project File System Operations
 */

const fs = require('fs');
const path = require('path');

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
    
    return { success: true };
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

