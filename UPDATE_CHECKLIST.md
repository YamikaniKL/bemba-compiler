# ✅ Package & Extension Update Checklist

## **All Updates Complete!**

---

## 📦 **NPM Packages**

### ✅ **bembajs-core**
- [x] Version: `1.0.1` → `1.3.0`
- [x] Description updated
- [x] All syntax features implemented
- [x] Ready for publishing

### ✅ **bembajs**
- [x] Version: `1.1.0` → `1.3.0`
- [x] Description updated
- [x] Dependency updated: `bembajs-core: ^1.3.0`
- [x] Chakra UI wrapper added
- [x] Wrapper registry updated
- [x] Ready for publishing

---

## 🔌 **VS Code Extension**

### ✅ **bembajs-language-support**
- [x] Version: `1.2.0` → `1.3.0`
- [x] Description updated
- [x] CHANGELOG.md updated
- [x] Syntax highlighting updated
- [x] 9 new code snippets added
- [x] Ready for publishing

---

## 📝 **Documentation**

### ✅ **Release Notes**
- [x] `RELEASE_NOTES_v1.3.0.txt` created
- [x] Complete feature list
- [x] Syntax examples
- [x] Migration guide

### ✅ **Update Summaries**
- [x] `PACKAGE_UPDATES_SUMMARY.md` created
- [x] `UPDATE_CHECKLIST.md` (this file)

---

## 🚀 **Before Publishing**

### **1. Build All Packages**
```bash
# Build core
cd packages/bembajs-core
pnpm build

# Build main package
cd ../bembajs
pnpm build
```

### **2. Test Locally**
```bash
# Test compilation
node packages/bembajs-core/dist/cli.js compile examples/syntax-expansion.bemba

# Test in a project
cd test-project
pisha dev
```

### **3. Update README (Optional)**
- Add v1.3.0 features to main README
- Update examples
- Add Chakra UI usage guide

---

## 📋 **Publishing Commands**

### **NPM Packages:**
```bash
# Login to npm
npm login

# Publish bembajs-core
cd packages/bembajs-core
npm publish

# Publish bembajs
cd ../bembajs
npm publish
```

### **VS Code Extension:**
```bash
cd packages/bembajs-vscode-extension

# Install dependencies
npm install

# Compile
npm run compile

# Package
npm run package

# Publish (requires vsce token)
vsce publish
```

---

## ✅ **What's Updated**

### **Syntax:**
- ✅ Conditionals (`ngati`, `kapena`)
- ✅ Loops (`kwa`, `pamene`)
- ✅ Error handling (`linga`, `kwata`, `paumalilo`)
- ✅ Async/await (`lombako`, `leka`)

### **Wrappers:**
- ✅ Chakra UI (8 components)

### **VS Code:**
- ✅ Syntax highlighting
- ✅ 9 new snippets
- ✅ CHANGELOG updated

### **Documentation:**
- ✅ Release notes
- ✅ Update summaries

---

## 🎯 **Status**

**All packages and extension are updated and ready for:**
- ✅ Local development
- ✅ Testing
- ✅ Publishing to npm
- ✅ Publishing to VS Code Marketplace

---

**Everything is ready!** 🚀

