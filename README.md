# BembaJS

<div align="center">

![BembaJS Logo](https://ik.imagekit.io/1umfxhnju/bemba-logo.svg?updatedAt=1761557358350)

**A Next.js-like framework for programming in the Bemba language** 🇿🇲

[![npm version](https://badge.fury.io/js/bembajs.svg)](https://www.npmjs.com/package/bembajs)
[![npm downloads](https://img.shields.io/npm/dm/bembajs.svg)](https://www.npmjs.com/package/bembajs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue)](https://marketplace.visualstudio.com/items?itemName=bembajs.bembajs-language-support)

*Programming in Bemba Language - Made Easy!*

</div>

---

## ✨ **What's New in Version 1.0**

🎉 **BembaJS Version 1.0** is here! This major release brings:

- 🎨 **VS Code Extension** - Full marketplace integration with syntax highlighting
- 🚀 **Next.js-like Styling** - Beautiful Tailwind CSS integration
- 🌍 **Rich Bemba Content** - Programming in authentic Bemba language
- ⚡ **Automatic IDE Support** - Works seamlessly like JavaScript files
- 📦 **Production Ready** - Optimized builds and deployment ready

---

## 🚀 **Quick Start**

### **Create Your First BembaJS App**

```bash
# Create a new project
npm create bembajs@latest my-app

# Navigate to your project
cd my-app

# Install dependencies
npm install

# Start development server
npm run dev
```

**That's it!** Open [http://localhost:3000](http://localhost:3000) to see your app running.

### **VS Code Extension (Recommended)**

For the best development experience, install the official VS Code extension:

1. **Open VS Code**
2. **Go to Extensions** (Ctrl+Shift+X)
3. **Search**: "BembaJS Language Support"
4. **Click Install**

Or install via command line:
```bash
code --install-extension bembajs.bembajs-language-support
```

---

## 🎨 **VS Code/Cursor Integration**

BembaJS now includes **professional IDE support** with:

### **✨ Features**
- 🎨 **Syntax Highlighting** - Full color-coded BembaJS keywords
- 🎯 **File Icons** - Custom icons for `.bemba` files
- 📝 **Code Snippets** - Auto-completion for common patterns
- 🚀 **Commands** - Right-click to create projects and start servers
- 🌍 **Language Support** - Complete BembaJS language integration

### **📦 Installation Options**

#### **Option 1: VS Code Marketplace (Recommended)**
```bash
# Install from marketplace
code --install-extension bembajs.bembajs-language-support
```

#### **Option 2: Global Installation**
```bash
# Install globally
npm install -g bembajs@latest

# Install IDE support
bemba install-ide
```

#### **Option 3: Automatic (New Projects)**
New BembaJS projects automatically include VS Code configuration:
```bash
npm create bembajs@latest my-app
# .bemba files automatically recognized!
```

---

## 🎯 **Core Features**

### **🌍 Bemba Language Programming**
Write web applications in the beautiful Bemba language:

```bemba
pangaIpepa('Home', {
    umutwe: 'Tantika ukupanga ukulemba',
    ilyashi: 'Bika na ukumona ifyakusendeka mwangu. Ya ku <a href="https://github.com/YamikaniKL/bemba-compiler">Learning Center</a>',
    ifiputulwa: [
        {
            umutwe: 'Ukutampa bwino',
            ilyashi: 'Lemba pali amapeji/index.bemba file',
            amabatani: [
                {
                    ilembo: 'Panga pa Vercel',
                    pakuKlikisha: 'window.open("https://vercel.com/new", "_blank")'
                },
                {
                    ilembo: 'Soma amakalata yetu',
                    pakuKlikisha: 'window.open("https://github.com/YamikaniKL/bemba-compiler", "_blank")'
                }
            ]
        }
    ]
});
```

### **🎨 Next.js-like Framework**
- ✅ **File-based Routing** - Pages in `amapeji/` directory
- ✅ **Component System** - Reusable components in `ifikopo/`
- ✅ **API Routes** - Server endpoints in `maapi/`
- ✅ **Static Assets** - Files in `maungu/` directory
- ✅ **Hot Reload** - Instant updates during development

### **⚡ Modern Development Experience**
- ✅ **Tailwind CSS** - Beautiful, responsive styling
- ✅ **TypeScript Support** - Optional type safety
- ✅ **Bun Optimization** - Native Bun support for faster builds
- ✅ **Production Ready** - Optimized builds for deployment

---

## 📦 **Packages**

This monorepo contains:

| Package | Description | Version |
|---------|-------------|---------|
| **`bembajs`** | Main framework with CLI and SDK | [![npm](https://img.shields.io/npm/v/bembajs.svg)](https://www.npmjs.com/package/bembajs) |
| **`create-bembajs`** | Project scaffolding tool | [![npm](https://img.shields.io/npm/v/create-bembajs.svg)](https://www.npmjs.com/package/create-bembajs) |
| **`bembajs-core`** | Core compiler (lexer, parser, transformer) | Internal |

---

## 🛠️ **CLI Commands**

```bash
# Create new project
bemba panga my-app

# Start development server
bemba tungulula

# Build for production
bemba akha

# Install IDE support
bemba install-ide

# Show help
bemba help
```

---

## 📚 **Documentation**

### **Project Structure**
```
my-app/
├── amapeji/           # Pages (like Next.js pages/)
│   └── index.bemba
├── ifikopo/           # Components (like Next.js components/)
│   ├── Button.bemba
│   └── Card.bemba
├── maapi/             # API routes (like Next.js api/)
│   ├── hello.bemba
│   └── users.bemba
├── maungu/            # Static files (like Next.js public/)
│   ├── favicon.ico
│   └── logo.png
├── bemba.config.js    # Configuration file
└── package.json
```

### **Bemba Language Syntax**

#### **Creating Pages**
```bemba
pangaIpepa('Home', {
    umutwe: 'Welcome to BembaJS',
    ilyashi: 'Build amazing web applications in Bemba',
    ifiputulwa: [
        {
            umutwe: 'Get Started',
            ilyashi: 'Learn BembaJS programming',
            amabatani: [
                {
                    ilembo: 'Click Me',
                    pakuKlikisha: 'londolola("Hello from Bemba!")'
                }
            ]
        }
    ]
});
```

#### **Creating Components**
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
            border-radius: 8px;
        }
    `
});
```

#### **Creating API Routes**
```bemba
pangaApi('hello', {
    method: 'GET',
    handler: `
        return {
            status: 200,
            data: { 
                message: 'Hello from BembaJS!',
                language: 'Bemba'
            }
        };
    `
});
```

---

## 🌟 **Bun Support**

BembaJS is optimized for Bun with native performance:

```bash
# Install with Bun
bun install -g bembajs

# Create project with Bun
bun create bembajs my-app

# Run with Bun (faster!)
cd my-app
bun run dev
```

**Bun Features:**
- ⚡ **Native Transpiler** - Faster builds
- 🔥 **Hot Reload** - Instant updates
- 💾 **SQLite Caching** - Faster subsequent builds
- 📦 **Bundler** - Optimized production builds

---

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
# Deploy to Vercel
npm install -g vercel
vercel
```

### **Other Platforms**
- **Netlify** - Static site hosting
- **Railway** - Full-stack deployment
- **Render** - Container deployment
- **AWS** - Cloud hosting

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

```bash
# Fork the repository
git clone https://github.com/YamikaniKL/bemba-compiler.git
cd bemba-compiler

# Install dependencies
pnpm install

# Build packages
pnpm build

# Run tests
pnpm test
```

**Contributing Areas:**
- 🐛 **Bug Fixes** - Report and fix issues
- ✨ **New Features** - Add functionality
- 📚 **Documentation** - Improve docs
- 🎨 **VS Code Extension** - Enhance IDE support
- 🌍 **Bemba Language** - Improve language features

---

## 📞 **Support & Community**

- 🌐 **Website**: [https://bembajs.dev](https://bembajs.dev)
- 📖 **Documentation**: [https://github.com/YamikaniKL/bemba-compiler](https://github.com/YamikaniKL/bemba-compiler)
- 🐛 **Issues**: [GitHub Issues](https://github.com/YamikaniKL/bemba-compiler/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/YamikaniKL/bemba-compiler/discussions)
- 📧 **Email**: [support@bembajs.dev](mailto:support@bembajs.dev)

---

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the Zambian developer community** 🇿🇲

*Making programming accessible in African languages*

[![Star on GitHub](https://img.shields.io/github/stars/YamikaniKL/bemba-compiler?style=social)](https://github.com/YamikaniKL/bemba-compiler)
[![Follow on Twitter](https://img.shields.io/twitter/follow/bembajs?style=social)](https://twitter.com/bembajs)

</div>