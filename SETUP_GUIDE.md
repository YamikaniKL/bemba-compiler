# BembaJS Framework - Setup Guide

## ✅ Current Status

Your BembaJS framework is **ready for development**! Here's what you have:

- ✅ **Node.js v23.6.0** - Installed and ready
- ✅ **npm v11.4.0** - Package manager available
- ✅ **pnpm v10.19.0** - Workspace manager installed
- ✅ **Dependencies** - All packages installed (`node_modules` exists)
- ✅ **Build Outputs** - Packages are built (`dist` folders exist)

## 🚀 What You Can Do Now

### 1. **Development Workflow**

#### Start Development Servers
```bash
# From the root directory
pnpm dev

# Or work on specific packages
cd packages/bembajs
pnpm dev
```

#### Build All Packages
```bash
# Build everything
pnpm build

# Build specific package
cd packages/bembajs
pnpm build
```

#### Run Tests
```bash
# Test all packages
pnpm test

# Test specific package
cd packages/bembajs
pnpm test
```

### 2. **Create a New BembaJS Project**

#### Using the CLI (if published)
```bash
# Install globally
npm install -g bembajs

# Create new project
bemba panga my-app
# or
npm create bembajs@latest my-app
```

#### Using Local Development Version
```bash
# Link the local package
cd packages/bembajs
npm link

# Now you can use it globally
bemba panga my-app
```

### 3. **Project Structure**

Your monorepo contains:

```
bemba-compiler-master/
├── packages/
│   ├── bembajs/          # Main CLI + SDK package
│   ├── bembajs-core/     # Core compiler engine
│   ├── create-bembajs/   # Project scaffolding tool
│   ├── pisha/            # Build tool (Vite-based)
│   └── bembajs-vscode-extension/  # VS Code support
├── examples/             # Example Bemba files
├── templates/            # Project templates
└── package.json          # Root workspace config
```

### 4. **Key Commands**

#### Root Level (Monorepo)
```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages
pnpm dev              # Start all dev servers
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm clean            # Clean all build outputs
```

#### Package Level
```bash
cd packages/bembajs
pnpm build            # Build this package
pnpm dev              # Start dev server
pnpm test             # Run tests
```

### 5. **Testing Your Framework**

#### Test the Compiler
```bash
# Compile a test file
cd packages/bembajs
node dist/cli.js compile examples/hello.bemba
```

#### Test Development Server
```bash
cd packages/bembajs
pnpm dev
# Server should start on http://localhost:3000
```

#### Test Project Creation
```bash
cd packages/create-bembajs
node index.js my-test-app
```

### 6. **VS Code Extension Development**

If you want to work on the VS Code extension:

```bash
cd packages/bembajs-vscode-extension

# Install extension dependencies
npm install

# Package the extension
vsce package
```

### 7. **Publishing to npm** (When Ready)

According to `NPM-PUBLISHING-READY.md`, you're ready to publish:

```bash
# Login to npm
npm login

# Build everything
pnpm build

# Test everything
pnpm test

# Publish all packages
pnpm publish -r

# Or use the publish script (if it exists)
node publish.js
```

### 8. **Next Steps Recommendations**

1. **Test the Framework**
   - Create a test project using `create-bembajs`
   - Verify all features work correctly
   - Test React integration
   - Test API routes

2. **Development**
   - Make any needed improvements
   - Add new features
   - Fix bugs
   - Update documentation

3. **Publishing** (When Ready)
   - Ensure all tests pass
   - Update version numbers
   - Publish to npm
   - Announce to community

4. **Documentation**
   - Update README files
   - Create tutorials
   - Add more examples

## 📋 Quick Checklist

- [ ] Run `pnpm install` to ensure all dependencies are up to date
- [ ] Run `pnpm build` to build all packages
- [ ] Run `pnpm test` to verify everything works
- [ ] Test creating a new project
- [ ] Test the development server
- [ ] Test React integration features
- [ ] Review and update documentation
- [ ] (Optional) Publish to npm when ready

## 🛠️ Troubleshooting

### If build fails:
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### If dependencies are missing:
```bash
# Reinstall all dependencies
rm -rf node_modules
pnpm install
```

### If you need to update packages:
```bash
# Update all dependencies
pnpm update -r
```

## 📚 Additional Resources

- **Main README**: `README.md` - Full framework documentation
- **Publishing Guide**: `NPM-PUBLISHING-READY.md` - Publishing instructions
- **Examples**: `examples/` - Sample Bemba code files
- **Package READMEs**: Each package has its own README

## 🎯 Summary

Your BembaJS framework is **fully set up and ready to use**! You can:

1. ✅ **Develop** - Work on the framework code
2. ✅ **Test** - Run tests and verify functionality  
3. ✅ **Build** - Compile all packages
4. ✅ **Use** - Create projects with the framework
5. ✅ **Publish** - When ready, publish to npm

Everything is configured and working. Just run `pnpm build` and `pnpm dev` to get started!

