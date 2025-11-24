# 📦 Publishing Guide - BembaJS v1.3.0

## ✅ **Pre-Publishing Checklist**

### **1. Verify npm Login**
```bash
npm whoami
# Should show: yamikanikalonge
```

✅ **You're logged in as:** `yamikanikalonge`

### **2. Current Published Versions**
- `bembajs`: 1.1.0 (will publish 1.3.0)
- `bembajs-core`: 1.0.1 (will publish 1.3.0)

### **3. New Versions to Publish**
- `bembajs-core`: **1.3.0** ✅
- `bembajs`: **1.3.0** ✅

### **4. Package Ownership**
✅ You own both packages (yamikanikalonge)

---

## 🚀 **Publishing Steps**

### **Option 1: Manual Publishing (Recommended)**

#### **Step 1: Build Packages**
```bash
# Build bembajs-core
cd packages/bembajs-core
pnpm build
# or
npm run build

# Build bembajs
cd ../bembajs
pnpm build
# or
npm run build
```

#### **Step 2: Verify Build Output**
```bash
# Check dist folders exist
ls packages/bembajs-core/dist
ls packages/bembajs/dist
```

#### **Step 3: Publish bembajs-core First**
```bash
cd packages/bembajs-core

# Dry run (test without publishing)
npm publish --dry-run

# If dry run looks good, publish
npm publish
```

#### **Step 4: Publish bembajs**
```bash
cd ../bembajs

# Dry run first
npm publish --dry-run

# If dry run looks good, publish
npm publish
```

---

### **Option 2: Using Publishing Script**

```bash
# Run the publishing script
node publish-to-npm.js
```

The script will:
- ✅ Check npm login
- ✅ Verify versions
- ✅ Build if needed
- ✅ Ask for confirmation
- ✅ Publish both packages

---

## ⚠️ **Important Notes**

### **Publishing Order**
1. **bembajs-core** must be published FIRST (bembajs depends on it)
2. Then publish **bembajs**

### **What Gets Published**

**bembajs-core:**
- `dist/` folder (compiled code)
- `README.md`
- `package.json`

**bembajs:**
- `dist/` folder (compiled code)
- `bin/` folder (CLI)
- `vscode/` folder (VS Code support)
- `README.md`
- `package.json`

### **Files Excluded**
- `src/` (source files - not needed in npm package)
- `node_modules/`
- `test/`
- `.git/`

---

## 🔍 **Verify Before Publishing**

### **Check Package Contents**
```bash
# See what will be published (dry run)
cd packages/bembajs-core
npm pack --dry-run

cd ../bembajs
npm pack --dry-run
```

### **Check Package.json**
- ✅ Version is 1.3.0
- ✅ Description is updated
- ✅ Dependencies are correct
- ✅ Files array includes all needed files

---

## 📋 **After Publishing**

### **Verify on npm**
```bash
# Check published versions
npm view bembajs-core version
npm view bembajs version

# Should show: 1.3.0
```

### **Update Documentation**
- ✅ Update main README with v1.3.0 features
- ✅ Announce on GitHub
- ✅ Update website (if applicable)

---

## 🎯 **Quick Publish Commands**

```bash
# One-liner (after building)
cd packages/bembajs-core && npm publish && cd ../bembajs && npm publish
```

---

## ❓ **Troubleshooting**

### **If "Package already exists" error:**
- Version 1.3.0 might already be published
- Check: `npm view bembajs version`
- If needed, bump to 1.3.1

### **If "Not authorized" error:**
- Verify login: `npm whoami`
- Check package ownership: `npm owner ls bembajs`
- Re-login if needed: `npm login`

### **If build fails:**
- Check Node.js version: `node --version` (needs >=16.0.0)
- Install dependencies: `pnpm install`
- Try building manually

---

## ✅ **Ready to Publish!**

You're all set! Run the commands above to publish v1.3.0 to npm.

**Current Status:**
- ✅ Logged in: yamikanikalonge
- ✅ Versions updated: 1.3.0
- ✅ Packages ready: bembajs-core, bembajs
- ✅ Build folders exist

**Next Step:** Run the publishing commands! 🚀

