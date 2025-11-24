# BembaJS Syntax Expansion Roadmap

## 🎯 Overview

Expanding the Bemba language syntax to support more programming patterns, making it more powerful and expressive while maintaining the beauty of the Bemba language.

---

## ✅ **Current Syntax (v1.2.0)**

### **Component Definitions**
- `fyambaIcipanda` - Create component
- `pangaIpepa` - Create page
- `pangaApi` - Create API route

### **State Management**
- `ukusunga` - Basic state
- `ukusungaKabili` - State with effects
- `ukuCinja` - Update state

### **Props & Validation**
- `ificingilila` - Define props
- `type`, `required`, `default` - Prop validation

### **Events**
- `pakuKlikisha` - onClick
- `pakuLemba` - onChange
- `pakuTumina` - onSubmit
- `pakuCinja` - onSelectChange
- `pakuIngia` - onFocus
- `pakuFuma` - onBlur
- `pakuKwesha` - onMouseEnter
- `pakuSiya` - onMouseLeave

### **Import/Export**
- `ingisa` - import
- `fumya` - export
- `ukufuma` - from
- `chisangwa` - default
- `nga` - as

### **Hooks (Defined but not fully used)**
- `bomfyaFyakubika` - useState
- `bomfyaCintikoLya` - useEffect
- `bomfyaUkwikala` - useContext
- `bomfyaUkusangula` - useRef
- `bomfyaUkukonkelesha` - useReducer
- `bomfyaUkwipaya` - useMemo
- `bomfyaUkubomfya` - useCallback

### **Built-in Functions**
- `londolola` - console.log
- `ukuPima` - string.length
- `ukuPindula` - string.replace
- `ukuGawanya` - string.split / division
- `ukuSanganya` - array.join
- `ukuOnjela` - array.push
- `ukuCotola` - array.splice
- `ukuSankha` - array.filter
- `ukuBalisha` - addition
- `ukuCepula` - subtraction
- `ukuCilisha` - multiplication

---

## 🚀 **Priority 1: Essential Control Flow**

### **1. Conditional Statements** 🔀

**Current:** No native if/else syntax  
**Need:** Conditional rendering and logic

**Proposed Syntax:**
```bemba
// If statement
ngati (condition) {
    // code
}

// If-else
ngati (condition) {
    // code
} kapena {
    // code
}

// If-else-if
ngati (condition1) {
    // code
} kapena ngati (condition2) {
    // code
} kapena {
    // code
}

// Ternary operator
condition ? value1 : value2
// Bemba version:
condition ? value1 : value2  // Keep same, or use:
condition ? value1 : value2  // or
ngati condition ? value1 : value2
```

**Usage in Components:**
```bemba
fyambaIcipanda('ConditionalComponent', {
    ukusunga: {
        wasalwa: true,
        namba: 5
    },
    ifiputulwa: {
        ngati (wasalwa) {
            umutwe: 'Wasalwa!'
        } kapena {
            umutwe: 'Tawasalwa'
        },
        
        ilyashi: ngati (namba > 10) ? 'Namba ikulu' : 'Namba ikalamba'
    }
});
```

---

### **2. Loops** 🔄

**Current:** No loop syntax  
**Need:** Iterate over arrays/objects

**Proposed Syntax:**
```bemba
// For loop
kwa (item mu array) {
    // code
}

// For with index
kwa (index, item mu array) {
    // code
}

// While loop
pamene (condition) {
    // code
}

// Do-while
cita {
    // code
} pamene (condition)
```

**Usage:**
```bemba
fyambaIcipanda('ListComponent', {
    ukusunga: {
        abantu: ['John', 'Jane', 'Bob']
    },
    ifiputulwa: {
        amabatani: kwa (muntu mu abantu) {
            {
                ilembo: muntu,
                pakuKlikisha: `londolola('${muntu}')`
            }
        }
    }
});
```

---

### **3. Switch/Case** 🔀

**Proposed Syntax:**
```bemba
sankha (value) {
    case 'option1': {
        // code
        bwelela
    }
    case 'option2': {
        // code
        bwelela
    }
    default: {
        // code
    }
}
```

---

## 🚀 **Priority 2: Async & Error Handling**

### **4. Async/Await** ⚡

**Current:** Defined but not fully implemented  
**Need:** Full async support

**Proposed Syntax:**
```bemba
// Async function
lombako nokuti fetchData() {
    const data = leka fetch('/api/data');
    bwelela data;
}

// In components
fyambaIcipanda('AsyncComponent', {
    ukusungaKabili: {
        data: null,
        loading: true,
        effect: lombako nokuti() {
            const result = leka fetch('/api/data');
            const json = leka result.json();
            ukuCinja('data', json);
            ukuCinja('loading', false);
        }
    }
});
```

---

### **5. Try/Catch/Finally** 🛡️

**Proposed Syntax:**
```bemba
linga {
    // code that might fail
} kwata (error) {
    // handle error
    londololaError(error.message);
} paumalilo {
    // cleanup code
}
```

**Usage:**
```bemba
fyambaIcipanda('ErrorHandlingComponent', {
    ukusungaKabili: {
        data: null,
        error: null,
        effect: lombako nokuti() {
            linga {
                const result = leka fetch('/api/data');
                const json = leka result.json();
                ukuCinja('data', json);
            } kwata (error) {
                ukuCinja('error', error.message);
                londololaError('Ifipushi: ' + error.message);
            }
        }
    }
});
```

---

## 🚀 **Priority 3: Advanced Component Features**

### **6. Context Providers** 🌐

**Proposed Syntax:**
```bemba
// Create context
pangaContext('ThemeContext', {
    defaultValue: 'light',
    provider: 'ThemeProvider',
    hook: 'useTheme'
});

// Use in component
fyambaIcipanda('ThemedComponent', {
    ifiputulwa: {
        ukusunga: {
            theme: useTheme()
        },
        ilyashi: 'Theme: ' + theme
    }
});
```

---

### **7. Error Boundaries** 🛡️

**Proposed Syntax:**
```bemba
pangaErrorBoundary('GlobalError', {
    ifiputulwa: {
        umutwe: 'Ifipushi fyapangene',
        ilyashi: 'Something went wrong. Please try again.',
        amabatani: [
            {
                ilembo: 'Bwelela',
                pakuKlikisha: 'window.location.reload()'
            }
        ]
    }
});
```

---

### **8. Loading States** ⏳

**Proposed Syntax:**
```bemba
pangaLoading('PageLoading', {
    ifiputulwa: {
        ilyashi: 'Loading...',
        spinner: true
    }
});

// Or in components
fyambaIcipanda('DataComponent', {
    ukusunga: {
        data: null,
        loading: true
    },
    ifiputulwa: {
        ngati (loading) {
            pangaLoading('LoadingData')
        } kapena {
            ilyashi: 'Data: ' + data
        }
    }
});
```

---

### **9. Suspense Boundaries** ⏸️

**Proposed Syntax:**
```bemba
pangaSuspense('DataSuspense', {
    fallback: {
        ilyashi: 'Loading data...'
    },
    ifiputulwa: {
        // async component content
    }
});
```

---

## 🚀 **Priority 4: Routing & Navigation**

### **10. Navigation** 🧭

**Proposed Syntax:**
```bemba
// Navigate to route
ukuya('/about')

// Navigate with params
ukuya('/users/' + userId)

// Go back
ukubwelela()

// Get route params
const params = ifyapilibula()
const userId = params.id

// Get query params
const query = ukufunafuna()
const search = query.search
```

**Usage:**
```bemba
fyambaIcipanda('NavigationComponent', {
    ifiputulwa: {
        amabatani: [
            {
                ilembo: 'Yaya ku About',
                pakuKlikisha: 'ukuya("/about")'
            },
            {
                ilembo: 'Bwelela',
                pakuKlikisha: 'ukubwelela()'
            }
        ]
    }
});
```

---

### **11. Middleware** 🔐

**Proposed Syntax:**
```bemba
pangaMiddleware({
    matcher: ['/dashboard/*', '/admin/*'],
    pakuKutanga: lombako nokuti(request) {
        ngati (!request.cookies.auth) {
            bwelela redirect('/login');
        }
        
        ngati (request.path.startsWith('/admin') && !isAdmin()) {
            bwelela redirect('/dashboard');
        }
        
        bwelela next();
    }
});
```

---

## 🚀 **Priority 5: More JSX Elements**

### **12. Additional HTML Elements** 🏗️

**Current:** Limited JSX elements  
**Need:** More HTML element equivalents

**Proposed Additions:**
```bemba
// Forms
pangaForm - form
ukulemba - input
ukusankha - select
ukulondolola - textarea
ukusunga - checkbox
ukusankhaRadio - radio

// Media
icikope - img
icikopeVideo - video
icikopeAudio - audio

// Layout
icipandwa - div
iciputulwa - section
umutwe - header
umusebo - footer
umutwe_ukulu - h1
umutwe_ukalamba - h2
umutwe_ukalamba_katono - h3
ukupandika - span
ukulondolola - p

// Lists
ulondolola - ul
ilondolola - li
ulondololaOlondolola - ol

// Tables
iciselo - table
umutwe_waCiselo - thead
umubili_waCiselo - tbody
umusebo_waCiselo - tfoot
umutwe_waCiselo - tr
iciselo_waCiselo - td
iciselo_waMutwe - th

// Links
umukunko - a
umukunko_waCiselo - link (Next.js Link)
```

---

## 🚀 **Priority 6: Type System**

### **13. Type Definitions** 📘

**Proposed Syntax:**
```bemba
// Define types
pangaType('User', {
    izina: 'string',
    umaka: 'number',
    email: 'string',
    wasalwa: 'boolean'
});

// Use in props
fyambaIcipanda('UserCard', {
    ificingilila: {
        user: { type: 'User', required: true }
    }
});

// Generic types
pangaType('List<T>', {
    items: 'T[]',
    count: 'number'
});
```

---

### **14. Interfaces** 🔌

**Proposed Syntax:**
```bemba
pangaInterface('ApiResponse', {
    success: 'boolean',
    data: 'any',
    error: 'string | null'
});
```

---

## 🚀 **Priority 7: Advanced Patterns**

### **15. Generators & Iterators** 🔄

**Proposed Syntax:**
```bemba
pangaGenerator('numberGenerator', nokuti*() {
    kwa (let i = 0; i < 10; i++) {
        bwelela i;
    }
});
```

---

### **16. Decorators** 🎨

**Proposed Syntax:**
```bemba
@memoize
@validate
fyambaIcipanda('DecoratedComponent', {
    // ...
});
```

---

### **17. Higher-Order Components** 🧩

**Proposed Syntax:**
```bemba
pangaHOC('withAuth', (Component) => {
    bwelela fyambaIcipanda('AuthenticatedComponent', {
        ukusungaKabili: {
            authenticated: false,
            effect: lombako nokuti() {
                const auth = leka checkAuth();
                ukuCinja('authenticated', auth);
            }
        },
        ifiputulwa: {
            ngati (authenticated) {
                Component
            } kapena {
                ilyashi: 'Please login'
            }
        }
    });
});
```

---

## 🚀 **Priority 8: Utility Syntax**

### **18. Destructuring** 📦

**Proposed Syntax:**
```bemba
// Object destructuring
const { izina, umaka } = user;

// Array destructuring
const [first, second] = array;

// In function params
fyambaIcipanda('Component', {
    ificingilila: {
        user: { izina, umaka }
    }
});
```

---

### **19. Spread Operator** 📤

**Proposed Syntax:**
```bemba
// Spread arrays
const newArray = [...oldArray, newItem];

// Spread objects
const newObject = { ...oldObject, newProp: value };

// In components
fyambaIcipanda('Component', {
    ifiputulwa: {
        ifikopo: [
            ...baseComponents,
            { name: 'NewComponent' }
        ]
    }
});
```

---

### **20. Optional Chaining** 🔗

**Proposed Syntax:**
```bemba
// Safe property access
const name = user?.izina;
const email = user?.contact?.email;

// Safe method call
const result = api?.fetch?.();
```

---

### **21. Nullish Coalescing** ❓

**Proposed Syntax:**
```bemba
// Default value if null/undefined
const name = user?.izina ?? 'Unknown';
const count = data?.count ?? 0;
```

---

## 📋 **Implementation Priority**

### **Phase 1: Essential (v1.3.0)**
1. ✅ Conditional statements (`ngati`, `kapena`)
2. ✅ Loops (`kwa`, `pamene`)
3. ✅ Async/await (`lombako`, `leka`)
4. ✅ Try/catch (`linga`, `kwata`)

### **Phase 2: Component Features (v1.4.0)**
5. ✅ Context providers (`pangaContext`)
6. ✅ Error boundaries (`pangaErrorBoundary`)
7. ✅ Loading states (`pangaLoading`)
8. ✅ Suspense (`pangaSuspense`)

### **Phase 3: Routing (v1.5.0)**
9. ✅ Navigation (`ukuya`, `ukubwelela`)
10. ✅ Middleware (`pangaMiddleware`)

### **Phase 4: Advanced (v2.0.0)**
11. ✅ Type system (`pangaType`, `pangaInterface`)
12. ✅ More JSX elements
13. ✅ Destructuring & spread
14. ✅ Optional chaining

---

## 🎯 **Quick Wins (Can Implement Now)**

### **1. Conditional Rendering** (2-3 hours)
```bemba
// Add to parser
ngati (condition) { ... } kapena { ... }
```

### **2. Loops** (3-4 hours)
```bemba
// Add to parser
kwa (item mu array) { ... }
```

### **3. Navigation** (2-3 hours)
```bemba
// Add to router
ukuya('/path')
ukubwelela()
```

---

## 📝 **Files to Update**

### **Core Compiler:**
- `packages/bembajs-core/src/constants.js` - Add new keywords
- `packages/bembajs-core/src/lexer.js` - Tokenize new syntax
- `packages/bembajs-core/src/parser.js` - Parse new constructs
- `packages/bembajs-core/src/transformer.js` - Transform to React
- `packages/bembajs-core/src/generator.js` - Generate JSX

### **VS Code Extension:**
- `packages/bembajs-vscode-extension/syntaxes/bemba.tmLanguage.json` - Syntax highlighting
- `packages/bembajs-vscode-extension/snippets/bemba.json` - Code snippets

---

## 🎯 **Success Metrics**

- **Syntax Coverage:** 80%+ of common React patterns
- **Developer Satisfaction:** Easier to write Bemba code
- **Code Readability:** More expressive and natural
- **Performance:** No performance degradation

---

**Next Steps:** Start with Phase 1 (Conditionals, Loops, Async) - these are the most needed and will have the biggest impact!

