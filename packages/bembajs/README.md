# BembaJS

[![npm version](https://badge.fury.io/js/bembajs.svg)](https://badge.fury.io/js/bembajs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**BembaJS** - A Next.js-like framework for programming in Bemba language 🇿🇲

## 🚀 Quick Start

### Installation

```bash
# Install globally
bun add -g bembajs

# Or use with bunx
bunx bembajs --help
```

### Create Your First Project

```bash
# Using CLI
bemba panga my-app

# Using npm create (Next.js style)
npm create bembajs@latest my-app
```

### Development

```bash
cd my-app
npm run dev
# Server starts at http://localhost:3000
```

## 📚 CLI Commands

```bash
bemba panga <name>       # Create new project
bemba tungulula          # Start development server
bemba akha               # Export static HTML → ./dist (pangaIpepa sites)
bemba fumya              # Same export → ./out
bemba emit-react         # Emit JSX for Vite/esbuild + React
bemba lint               # Lint Bemba code
bemba format             # Format Bemba code
bemba --version          # Show version
bemba help               # Show help
```

**Static export flags (akha / fumya):** `--base-url <url>` (or **`BEMBA_SITE_URL`**) for **`sitemap.xml`** / **`feed.xml`**, **`--locale <code>`** for **`<html lang>`**, **`--site-title`** for RSS, **`--no-bemba-site`** to skip **`bemba-site.js`**.

## 🏗️ Project Structure

```
my-app/
├── amapeji/          # Pages (like Next.js pages/)
│   ├── index.bemba
│   └── about.bemba
├── ifikopo/          # Components (like Next.js components/)
│   ├── Button.bemba
│   └── Card.bemba
├── maapi/            # API routes (like Next.js api/)
│   ├── hello.bemba
│   └── users.bemba
├── maungu/           # Static files (like Next.js public/)
│   ├── logo.png
│   └── style.css
└── package.json
```

## 💻 Programmatic Usage

```javascript
import { compile, createDevServer, build } from 'bembajs';

// Compile Bemba code
const result = compile(`
  pangaIpepa('Home', {
    umutwe: 'Mwaiseni ku BembaJS!',
    ilyashi: 'Welcome to BembaJS framework'
  });
`);

if (result.success) {
  console.log(result.code);
} else {
  console.error(result.error);
}

// Start dev server
const server = await createDevServer({
  port: 3000,
  watch: true
});

// Build for production
await build({
  output: 'dist'
});
```

## 🌟 Features

- **🇿🇲 Bemba Language** - Program in your native Zambian language
- **⚡ Next.js-like** - Familiar developer experience
- **🚀 Fast Development** - Hot reload and instant feedback
- **📦 Component-based** - Reusable Bemba components
- **🛣️ File-based Routing** - Automatic route generation
- **🔧 CLI Tools** - Powerful command-line interface
- **📱 Responsive** - Mobile-first design
- **🎨 Modern UI** - Beautiful default styling

## Code style and beginner-friendly UI

- **Standard JS** — new projects from **`bemba panga`** (via **bembajs-core**) include **`standard`**, **`bun run lint`**, and **`bun run lint:fix`** for any **`.js` / `.jsx`** you add (see [Standard JS](https://standardjs.com/)).
- **Google style guides** — use [JavaScript](https://google.github.io/styleguide/jsguide.html), [HTML/CSS](https://google.github.io/styleguide/htmlcssguide.html), and [TypeScript](https://google.github.io/styleguide/tsguide.html) as references; see **`docs/CODE-STYLE-AND-UI.md`** in generated projects.
- **shadcn-like static UI** — tokens and **`.bem-card` / `.bem-btn`** utilities live in **`amapeji/umusango.bemba`**; copy **`ifikopo/cipanda/StarterCard.bemba`** the same way you would [shadcn/ui](https://ui.shadcn.com/) components ([overview](https://shadcnstudio.com/blog/what-is-shadcn-ui-comprehensive-guide)).

## 📤 Production static sites & Vite + React

- **`bemba akha`** / **`bemba fumya`** run **`exportStaticHtmlSite`** from **bembajs-core**: plain HTML for **`pangaIpepa`** pages, public assets, optional **sitemap** / **RSS**, and optional **`bemba-site.js`** for small progressive enhancements.
- For **rich client UI** (headless components, animation libraries, SPA routing), use **`bemba emit-react -o dist/bemba-react`** then point **Vite** (or esbuild) at that folder and add **React**, **react-router**, etc. The emit step skips **`pangaIcapaba`-only** partials; keep heavy UI in **`fyambaIcipanda`** modules consumed by the bundler.

## 🎯 Templates

Choose from multiple project templates:

- **Base** - Basic BembaJS application
- **Dashboard** - Admin dashboard with charts
- **E-commerce** - Online store template
- **Blog** - Content management system

## 🔧 Configuration

Create `bemba.config.js` in your project root:

```javascript
module.exports = {
  // Development server port
  port: 3000,
  
  // Build output directory
  output: 'dist',
  
  // Enable TypeScript
  typescript: true,
  
  // Custom Bemba folder names
  folders: {
    pages: 'amapeji',
    components: 'ifikopo',
    api: 'maapi',
    static: 'maungu'
  }
};
```

## 🚀 Bun Support

BembaJS is optimized for Bun runtime:

```bash
# Install with Bun
bun install -g bembajs

# Create project with Bun
bun create bembajs my-app

# Development with Bun
bun run dev
```

## 📖 Documentation

- [Getting Started](https://docs.bembajs.dev/getting-started)
- [CLI Reference](https://docs.bembajs.dev/cli)
- [API Reference](https://docs.bembajs.dev/api)
- [Examples](https://docs.bembajs.dev/examples)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/bembajs/bembajs/blob/main/CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🌍 Community

- **Website**: https://bembajs.dev
- **GitHub**: https://github.com/bembajs/bembajs
- **Discord**: https://discord.gg/bembajs
- **Twitter**: @BembaJS

---

**Made with ❤️ in Zambia 🇿🇲**
