# Pisha

**The Vite-based build tool for BembaJS**

Pisha (meaning "to burn/ignite" in Bemba) is a lightning-fast build tool for BembaJS applications, built on top of Vite.

## Features

- **Lightning Fast** - Built on Vite for instant server start and HMR
- **BembaJS Native** - Compiles .bemba files to React/JSX
- **React Ecosystem** - Use any React library or npm package
- **Hot Module Replacement** - Instant updates without losing state
- **Optimized Builds** - Production-ready builds with minification
- **TypeScript Support** - Full TypeScript support out of the box
- **CSS Frameworks** - Tailwind CSS, Bootstrap, and more

## Installation

```bash
npm install -g pisha
```

## Quick Start

### Create a New Project

```bash
# Using create-bembajs (recommended)
npm create bembajs@latest my-app
cd my-app

# Start development server
pisha dev
```

### Commands

```bash
# Start development server
pisha dev

# Build for production
pisha build

# Preview production build
pisha preview

# Show help
pisha help
```

### Command Options

```bash
# Development server with custom port
pisha dev --port 8080

# Build with custom output directory
pisha build --outDir build

# Preview with custom port
pisha preview --port 5000
```

## Configuration

Create a `pisha.config.js` file in your project root:

```javascript
export default {
  server: {
    port: 3000,
    open: true
  },
  
  build: {
    outDir: 'dist',
    minify: true
  },
  
  bemba: {
    wrappers: {
      shadcn: true,
      mui: false
    },
    cssFrameworks: ['tailwind', 'bootstrap']
  }
};
```

## Project Structure

```
my-bembajs-app/
├── amapeji/              # Pages (file-based routing)
│   └── index.bemba
├── ifikopo/              # Components
│   └── Button.bemba
├── mafungulo/            # API routes
│   └── users.bemba
├── amashinda/            # Static assets
│   └── logo.svg
├── pisha.config.js       # Pisha configuration
├── package.json
└── index.html           # Entry point
```

## Usage

### Basic Component

```bemba
// ifikopo/Counter.bemba
fyambaIcipanda('Counter', {
    ukusunga: {
        namba: 0
    },
    ifiputulwa: {
        umutwe: 'Counter',
        amabatani: [
            {
                ilembo: 'Onjela: ' + namba,
                pakuKlikisha: 'ukuCinja("namba", namba + 1)'
            }
        ]
    }
});
```

### Using React Libraries

```bemba
// Import React components
ingisa { Button } ukufuma '@shadcn/ui'
ingisa MuiButton ukufuma '@mui/material/Button'

fyambaIcipanda('MyApp', {
    ifiputulwa: {
        ifikopo: [
            {
                name: 'Button',
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

## Features

### Hot Module Replacement

Pisha supports instant HMR for .bemba files. Changes are reflected immediately without losing component state.

### CSS Support

- **Tailwind CSS** - Built-in support with JIT mode
- **Bootstrap** - Full Bootstrap 5 support
- **CSS Modules** - Scoped styles
- **PostCSS** - Custom PostCSS configuration
- **Sass/SCSS** - Sass preprocessing

### React Integration

Pisha compiles BembaJS to standard React/JSX, allowing you to:

- Use any React component library
- Import npm packages
- Mix BembaJS and React components
- Use React hooks and context

## Performance

- **Instant Server Start** - No bundling in development
- **Lightning Fast HMR** - Updates in milliseconds
- **Optimized Builds** - Code splitting and tree shaking
- **Modern Browser Targets** - ES modules for better performance

## Examples

See the `examples/` directory for more usage examples:

- `shadcn-integration.bemba` - Using Shadcn/ui components
- `mui-integration.bemba` - Using Material-UI components
- `npm-packages.bemba` - Importing npm packages
- `mixed-react-bemba.bemba` - Mixing React and BembaJS

## Comparison with Other Tools

| Feature | Pisha | Next.js | Vite |
|---------|-------|---------|------|
| Bemba Language | ✅ | ❌ | ❌ |
| Hot Reload | ✅ | ✅ | ✅ |
| File-based Routing | ✅ | ✅ | ❌ |
| API Routes | ✅ | ✅ | ❌ |
| React Ecosystem | ✅ | ✅ | ✅ |
| Build Speed | ⚡ Fast | 🐌 Slow | ⚡ Fast |

## Contributing

We welcome contributions! See our [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

## Support

- **Documentation**: [GitHub Wiki](https://github.com/YamikaniKL/bemba-compiler/wiki)
- **Issues**: [GitHub Issues](https://github.com/YamikaniKL/bemba-compiler/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YamikaniKL/bemba-compiler/discussions)

---

**Made with ❤️ for the Bemba-speaking developer community**

