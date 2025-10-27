# BembaJS Language Support

A VS Code extension that provides comprehensive language support for BembaJS files (.bemba) with syntax highlighting, file icons, IntelliSense, and React integration features.

## Features

- 🎨 **Syntax Highlighting** - Full syntax highlighting for BembaJS keywords and React integration
- 🎯 **File Icons** - Custom icons for .bemba files
- 📝 **Snippets** - Code snippets for BembaJS patterns and React components
- 🚀 **Commands** - Quick commands to create projects and start dev servers
- 🌍 **Bemba Language** - Programming in the beautiful Bemba language
- ⚛️ **React Integration** - Full React ecosystem support with component wrappers
- 📦 **NPM Packages** - Import any npm package with Bemba syntax

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "BembaJS Language Support"
4. Click Install

## Usage

### Creating a New Project
1. Right-click in Explorer
2. Select "Create BembaJS Project"
3. Enter project name
4. Follow the prompts

### Starting Dev Server
1. Open a .bemba file
2. Right-click in editor
3. Select "Start Dev Server"

### File Association
The extension automatically associates .bemba files with BembaJS language support.

## Commands

- `BembaJS: Create Project` - Create a new BembaJS project
- `BembaJS: Start Dev Server` - Start the development server

## Language Features

### Core BembaJS
- Syntax highlighting for BembaJS keywords
- Auto-completion for common patterns
- Bracket matching and code folding
- Error detection and validation

### React Integration
- **Import/Export Support** - `ingisa`, `fumya`, `ukufuma`, `chisangwa`, `nga`
- **Component Wrappers** - Shadcn/ui, Material-UI, and more
- **NPM Package Imports** - Import any npm package
- **Mixed Components** - Use React and BembaJS together

### Code Snippets

#### Basic BembaJS
- `pangaIpepa` - Create a new page
- `fyambaIcipanda` - Create a component
- `pangaApi` - Create API route
- `ukusunga` - State management
- `ukuCinja` - State updates

#### React Integration
- `ingisa` - Import statements
- `ingisaNamed` - Named imports
- `fumya` - Export statements
- `reactComponent` - React component template
- `shadcn` - Shadcn/ui component wrapper
- `mui` - Material-UI component wrapper
- `npm` - NPM package imports

## Example Usage

### Basic BembaJS Component
```bemba
fyambaIcipanda('Counter', {
    ukusunga: {
        namba: 0
    },
    ifiputulwa: {
        umutwe: 'Counter: ' + namba,
        amabatani: [
            {
                ilembo: 'Increment',
                pakuKlikisha: 'ukuCinja("namba", namba + 1)'
            }
        ]
    }
});
```

### React Integration
```bemba
ingisa React ukufuma 'react'
ingisa { Button } ukufuma '@shadcn/ui'

fyambaIcipanda('MyApp', {
    ifiputulwa: {
        ifikopo: [
            {
                name: 'Button',
                library: 'shadcn',
                props: {
                    pakuKlikisha: 'londolola("Clicked!")',
                    imikalile: 'bg-blue-500 hover:bg-blue-700'
                },
                ifika: 'Click Me'
            }
        ]
    }
});
```

## Contributing

Contributions are welcome! Please see our [GitHub repository](https://github.com/YamikaniKL/bemba-compiler) for more information.

## License

MIT License - see LICENSE file for details.

## Support

- 🌐 Website: https://bembajs.dev
- 📖 Documentation: https://docs.bembajs.dev
- 💬 Issues: https://github.com/YamikaniKL/bemba-compiler/issues

---

**🇿🇲 Programming in Bemba Language with Full React Integration - Made Easy!**
