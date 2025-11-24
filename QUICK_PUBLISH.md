# 🚀 Quick Publish Guide

## ✅ **Current Status**

- **Logged in as:** `yamikanikalonge` ✅
- **Package owner:** You own both packages ✅
- **Current versions on npm:**
  - bembajs: 1.1.0
  - bembajs-core: 1.0.1
- **New versions to publish:**
  - bembajs-core: **1.3.0**
  - bembajs: **1.3.0**

---

## 📦 **Step-by-Step Publishing**

### **Step 1: Build Packages**

```bash
# Build bembajs-core
cd packages/bembajs-core
pnpm build

# Build bembajs  
cd ../bembajs
pnpm build
```

### **Step 2: Verify Builds**

```bash
# Check dist folders exist
ls packages/bembajs-core/dist
ls packages/bembajs/dist
```

### **Step 3: Test Publish (Dry Run)**

```bash
# Test bembajs-core
cd packages/bembajs-core
npm publish --dry-run

# Test bembajs
cd ../bembajs
npm publish --dry-run
```

### **Step 4: Publish to npm**

```bash
# Publish bembajs-core FIRST (bembajs depends on it)
cd packages/bembajs-core
npm publish

# Then publish bembajs
cd ../bembajs
npm publish
```

---

## ⚡ **One-Line Commands**

```bash
# Build both
cd packages/bembajs-core && pnpm build && cd ../bembajs && pnpm build

# Publish both (after building)
cd packages/bembajs-core && npm publish && cd ../bembajs && npm publish
```

---

## ✅ **After Publishing**

Verify on npm:
```bash
npm view bembajs-core version  # Should show 1.3.0
npm view bembajs version       # Should show 1.3.0
```

---

**Ready?** Run the build commands first, then publish! 🚀

