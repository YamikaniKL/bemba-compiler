# create-bembajs

[![npm version](https://badge.fury.io/js/create-bembajs.svg)](https://badge.fury.io/js/create-bembajs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**create-bembajs** - Create BembaJS apps with one command (like create-next-app) 🇿🇲

## 🚀 Quick Start

### Using npm
```bash
npm create bembajs@latest my-app
```

### Using npx
```bash
npx create-bembajs my-app
```

### Using Bun
```bash
bun create bembajs my-app
```

## 📋 Interactive Prompts

When you run `create-bembajs`, you'll be prompted with:

```
? What is your project name? › my-app
? Which template would you like to use? › Base (Recommended)
? Would you like to use TypeScript? › No
? Would you like to install dependencies? › Yes
? Would you like to initialize git? › Yes
? Would you like to open in VS Code? › Yes
```

## 🎯 Available Templates

### Base (Recommended)
A basic BembaJS application with:
- Home page (`amapeji/index.bemba`)
- About page (`amapeji/about.bemba`)
- Button component (`ifikopo/Button.bemba`)
- Card component (`ifikopo/Card.bemba`)
- Hello API route (`maapi/hello.bemba`)

### Dashboard
An admin dashboard template with:
- Dashboard layout
- Analytics components
- Data tables
- Charts and graphs
- User management

### E-commerce
An online store template with:
- Product catalog
- Shopping cart
- Checkout process
- User authentication
- Payment integration

### Blog
A content management template with:
- Article listing
- Individual post pages
- Author profiles
- Comment system
- Search functionality

## 🏗️ Generated Project Structure

```
my-app/
├── amapeji/              # Pages (like Next.js pages/)
│   ├── index.bemba       # Home page
│   └── about.bemba       # About page
├── ifikopo/              # Components (like Next.js components/)
│   ├── Button.bemba      # Reusable button
│   └── Card.bemba        # Reusable card
├── maapi/                # API routes (like Next.js api/)
│   ├── hello.bemba       # Hello API
│   └── users.bemba       # Users API
├── maungu/               # Static files (like Next.js public/)
│   ├── logo.png          # BembaJS logo
│   └── style.css         # Global styles
├── .vscode/              # VS Code configuration
│   ├── settings.json     # Editor settings
│   ├── extensions.json   # Recommended extensions
│   └── launch.json       # Debug configuration
├── bemba.config.js       # BembaJS configuration
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## ⚙️ Configuration Options

### Project Name
- **Required**: Yes
- **Description**: Name of your BembaJS project
- **Example**: `my-awesome-app`

### Template Selection
- **Base**: Basic application structure
- **Dashboard**: Admin dashboard with analytics
- **E-commerce**: Online store template
- **Blog**: Content management system

### TypeScript Support
- **Default**: No
- **Description**: Enable TypeScript for type safety
- **Files**: Adds `.ts` support and type definitions

### Dependency Installation
- **Default**: Yes
- **Description**: Automatically install npm dependencies
- **Command**: Runs `npm install` after project creation

### Git Initialization
- **Default**: Yes
- **Description**: Initialize git repository
- **Command**: Runs `git init` and creates initial commit

### VS Code Integration
- **Default**: Yes
- **Description**: Open project in VS Code after creation
- **Command**: Runs `code .` to open project

## 🎨 Custom Templates

You can create custom templates by:

1. **Creating template directory**:
```bash
mkdir templates/my-template
```

2. **Adding template files**:
```
templates/my-template/
├── amapeji/
├── ifikopo/
├── maapi/
├── maungu/
├── package.json
└── README.md
```

3. **Updating template list**:
```javascript
const templates = [
  { name: 'Base', value: 'base' },
  { name: 'Dashboard', value: 'dashboard' },
  { name: 'E-commerce', value: 'ecommerce' },
  { name: 'Blog', value: 'blog' },
  { name: 'My Template', value: 'my-template' } // Add your template
];
```

## 🔧 Advanced Usage

### Programmatic Usage
```javascript
const createBembaApp = require('create-bembajs');

await createBembaApp({
  name: 'my-app',
  template: 'base',
  typescript: false,
  install: true,
  git: true,
  vscode: false
});
```

### Custom Options
```bash
# Skip prompts with flags
npx create-bembajs my-app --template dashboard --typescript --no-install

# Available flags:
--template <name>    # Template to use
--typescript         # Enable TypeScript
--no-install         # Skip dependency installation
--no-git             # Skip git initialization
--no-vscode          # Skip VS Code opening
```

## 📦 Dependencies

The generated project includes:

### Core Dependencies
- `bembajs` - Main framework
- `bembajs-core` - Compiler engine
- `react` - UI library
- `react-dom` - DOM rendering

### Development Dependencies
- `@types/react` - TypeScript types (if TypeScript enabled)
- `@types/react-dom` - TypeScript types (if TypeScript enabled)
- `eslint` - Code linting
- `prettier` - Code formatting

## 🚀 Next Steps

After creating your project:

1. **Navigate to project**:
```bash
cd my-app
```

2. **Start development server**:
```bash
npm run dev
# or
bemba tungulula
```

3. **Build for production**:
```bash
npm run build
# or
bemba akha
```

4. **Deploy**:
```bash
npm run deploy
```

## 🔗 Related Packages

- [bembajs](https://www.npmjs.com/package/bembajs) - Main CLI and SDK
- [bembajs-core](https://www.npmjs.com/package/bembajs-core) - Compiler engine

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/bembajs/bembajs/blob/main/CONTRIBUTING.md).

---

**Made with ❤️ in Zambia 🇿🇲**
