# BembaJS

A Next.js-like framework for programming in the Bemba language 🇿🇲

## 🚀 Quick Start

### Create a New Project

```bash
# Using npm
npm create bembajs@latest my-app

# Using npx
npx create-bembajs my-app

# Using Bun
bun create bembajs my-app
```

### Install Globally

```bash
# Using npm
npm install -g bembajs

# Using Bun
bun install -g bembajs
```

### Use the CLI

```bash
# Create new project
bemba panga my-app

# Start development server
cd my-app
bemba tungulula

# Build for production
bemba akha
```

## 📦 Packages

This monorepo contains the following packages:

- **`@bembajs/core`** - Core compiler (lexer, parser, transformer, generator)
- **`bembajs`** - Main package with CLI and SDK
- **`create-bembajs`** - Project scaffolding tool (like create-next-app)

## 🎯 Features

- ✅ **Next.js-like Framework** - File-based routing, SSR, SSG
- ✅ **Bemba Language** - Program in Bemba with full syntax support
- ✅ **Component System** - Reusable components with props
- ✅ **API Routes** - Server-side API endpoints
- ✅ **Hot Module Replacement** - Fast development experience
- ✅ **Bun Optimization** - Native Bun support for faster builds
- ✅ **VS Code/Cursor Integration** - Full IDE support
- ✅ **TypeScript Support** - Optional type safety
- ✅ **Production Ready** - Optimized builds for deployment

## 📚 Documentation

### Installation Methods

#### Global Installation
```bash
npm install -g bembajs
```

Then use the CLI:
```bash
bemba panga my-app
cd my-app
bemba tungulula
```

#### Local Installation with npx
```bash
npx bembajs panga my-app
cd my-app
npx bemba tungulula
```

#### Using with Bun
```bash
bun install -g bembajs
bemba panga my-app
cd my-app
bun run dev
```

### Programmatic API (SDK)

```javascript
import { compile, createDevServer, build } from 'bembajs';

// Compile Bemba code
const result = compile(code);

// Start dev server programmatically
const server = await createDevServer({
  port: 3000,
  watch: true
});

// Build for production
await build({
  output: 'dist',
  minify: true
});
```

### CLI Commands

- `bemba panga <name>` - Create new project
- `bemba tungulula` - Start development server
- `bemba akha` - Build for production
- `bemba lint` - Lint Bemba code
- `bemba format` - Format Bemba code

### Bemba Language Syntax

#### Creating Pages
```bemba
pangaIpepa('Home', {
    umutwe: 'Welcome to BembaJS',
    ilyashi: 'Build amazing web applications',
    ifiputulwa: [
        {
            umutwe: 'Get Started',
            ilyashi: 'Learn BembaJS',
            amabatani: [
                {
                    ilembo: 'Click Me',
                    pakuKlikisha: 'londolola("Hello!")'
                }
            ]
        }
    ]
});
```

#### Creating Components
```bemba
fyambaIcipanda('Button', {
    ifiputulwa: {
        ilembo: 'Button',
        pakuKlikisha: 'londolola("Clicked!")'
    },
    imikalile: `
        .button {
            padding: 12px 24px;
            background: #667eea;
            color: white;
        }
    `
});
```

#### Creating API Routes
```bemba
pangaApi('hello', {
    method: 'GET',
    handler: `
        return {
            status: 200,
            data: { message: 'Hello from BembaJS!' }
        };
    `
});
```

## 🛠️ Development

### Setup

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Workspace Structure

```
bembajs/
├── packages/
│   ├── bembajs-core/     # Core compiler
│   ├── bembajs/          # Main package
│   └── create-bembajs/   # Scaffolding tool
├── package.json          # Root workspace config
└── pnpm-workspace.yaml   # Workspace definition
```

### Building Packages

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @bembajs/core build
pnpm --filter bembajs build
pnpm --filter create-bembajs build
```

### Testing

```bash
# Test all packages
pnpm test

# Test with Node.js
pnpm test:node

# Test with Bun
bun test
```

## 🌟 Bun Support

BembaJS is optimized for Bun with:

- **Bun's Native Transpiler** - Faster builds
- **Bun's File Watcher** - Hot reload
- **Bun's SQLite** - Caching
- **Bun's Bundler** - Production builds

### Using with Bun

```bash
# Install with Bun
bun install -g bembajs

# Create project with Bun
bun create bembajs my-app

# Run with Bun
cd my-app
bun run dev
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please see CONTRIBUTING.md for details.

## 📞 Support

- **Documentation**: [https://bembajs.dev/docs](https://bembajs.dev/docs)
- **GitHub**: [https://github.com/bembajs/bembajs](https://github.com/bembajs/bembajs)
- **Discord**: [https://discord.gg/bembajs](https://discord.gg/bembajs)
- **Email**: support@bembajs.dev

---

**Built with ❤️ for the Zambian developer community** 🇿🇲
