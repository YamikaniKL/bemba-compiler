# 🚀 Publish BembaJS v1.3.0 to npm

## ✅ **You're Ready to Publish!**

**Status:**
- ✅ Logged in as: **yamikanikalonge**
- ✅ You own both packages
- ✅ Versions updated: 1.3.0
- ✅ Package.json files updated

---

## 📦 **Publishing Commands**

### **Step 1: Build Packages (if needed)**

```powershell
# Build bembajs-core
cd packages\bembajs-core
node src\build.js

# Build bembajs
cd ..\bembajs
node build.js
```

### **Step 2: Test Publish (Dry Run)**

```powershell
# Test bembajs-core
cd packages\bembajs-core
npm publish --dry-run

# Test bembajs
cd ..\bembajs
npm publish --dry-run
```

### **Step 3: Publish to npm**

**⚠️ IMPORTANT: Publish bembajs-core FIRST!**

```powershell
# 1. Publish bembajs-core
cd packages\bembajs-core
npm publish

# 2. Then publish bembajs
cd ..\bembajs
npm publish
```

---

## ⚡ **Quick One-Liner (After Building)**

```powershell
cd packages\bembajs-core; npm publish; cd ..\bembajs; npm publish
```

---

## ✅ **Verify After Publishing**

```powershell
npm view bembajs-core version
npm view bembajs version
```

Both should show: **1.3.0**

---

## 📋 **What Will Be Published**

### **bembajs-core@1.3.0**
- ✅ Control flow syntax (ngati, kapena, kwa, pamene)
- ✅ Error handling (linga, kwata, paumalilo)
- ✅ Enhanced async/await (lombako, leka)

### **bembajs@1.3.0**
- ✅ Chakra UI wrapper
- ✅ All syntax features from bembajs-core
- ✅ Enhanced component wrappers

---

## 🎯 **Ready to Go!**

Run the commands above to publish v1.3.0! 🚀

**Remember:** Publish bembajs-core first, then bembajs.

