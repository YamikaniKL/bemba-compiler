# Quick Start: Syntax Expansion Implementation

## 🎯 Priority Syntax to Add First

These are the most critical syntax additions that will unlock more functionality.

---

## 1. Conditional Statements (`ngati`, `kapena`)

### **Step 1: Add to Constants**

Update `packages/bembajs-core/src/constants.js`:

```javascript
const BEMBA_SYNTAX = {
    // ... existing code ...
    
    // Control flow
    IF: 'ngati',
    ELSE: 'kapena',
    ELSE_IF: 'kapena ngati',
    TERNARY: '?',
    
    // ... rest of code ...
};
```

### **Step 2: Add to Lexer**

Update `packages/bembajs-core/src/lexer.js`:

```javascript
this.keywords = {
    // ... existing keywords ...
    'ngati': this.TOKEN_TYPES.IF,
    'kapena': this.TOKEN_TYPES.ELSE,
    // ... rest ...
};
```

### **Step 3: Add to Parser**

Update `packages/bembajs-core/src/parser.js`:

```javascript
parseIfStatement() {
    this.consume('IF', 'Expected ngati');
    this.consume('LEFT_PAREN', 'Expected ( after ngati');
    const condition = this.parseExpression();
    this.consume('RIGHT_PAREN', 'Expected ) after condition');
    this.consume('LEFT_BRACE', 'Expected { after condition');
    
    const thenBranch = this.parseBlock();
    let elseBranch = null;
    
    if (this.check('ELSE')) {
        this.advance();
        if (this.check('IF')) {
            // else if
            elseBranch = this.parseIfStatement();
        } else {
            this.consume('LEFT_BRACE', 'Expected { after kapena');
            elseBranch = this.parseBlock();
        }
    }
    
    return {
        type: 'IfStatement',
        condition,
        thenBranch,
        elseBranch
    };
}
```

### **Step 4: Transform to React**

Update `packages/bembajs-core/src/transformer.js`:

```javascript
transformIfStatement(node) {
    if (node.elseBranch) {
        return {
            type: 'ConditionalExpression',
            test: this.transform(node.condition),
            consequent: this.transform(node.thenBranch),
            alternate: this.transform(node.elseBranch)
        };
    }
    
    return {
        type: 'IfStatement',
        test: this.transform(node.condition),
        consequent: this.transform(node.thenBranch)
    };
}
```

### **Step 5: Generate JSX**

Update `packages/bembajs-core/src/generator.js`:

```javascript
generateIfStatement(node) {
    if (node.type === 'ConditionalExpression') {
        return `(${this.generate(node.test)} ? ${this.generate(node.consequent)} : ${this.generate(node.alternate)})`;
    }
    
    return `if (${this.generate(node.test)}) { ${this.generate(node.consequent)} }`;
}
```

### **Usage Example:**

```bemba
fyambaIcipanda('ConditionalComponent', {
    ukusunga: {
        wasalwa: true
    },
    ifiputulwa: {
        ngati (wasalwa) {
            umutwe: 'Wasalwa!'
        } kapena {
            umutwe: 'Tawasalwa'
        }
    }
});
```

---

## 2. Loops (`kwa`)

### **Step 1: Add to Constants**

```javascript
const BEMBA_SYNTAX = {
    // ... existing code ...
    FOR: 'kwa',
    IN: 'mu',
    WHILE: 'pamene',
    // ... rest ...
};
```

### **Step 2: Add to Lexer**

```javascript
this.keywords = {
    // ... existing ...
    'kwa': this.TOKEN_TYPES.FOR,
    'mu': this.TOKEN_TYPES.IN,
    'pamene': this.TOKEN_TYPES.WHILE,
    // ... rest ...
};
```

### **Step 3: Add to Parser**

```javascript
parseForStatement() {
    this.consume('FOR', 'Expected kwa');
    this.consume('LEFT_PAREN', 'Expected ( after kwa');
    
    const variable = this.consume('IDENTIFIER', 'Expected variable name');
    this.consume('IN', 'Expected mu');
    const iterable = this.parseExpression();
    
    this.consume('RIGHT_PAREN', 'Expected ) after for loop');
    this.consume('LEFT_BRACE', 'Expected { after for loop');
    
    const body = this.parseBlock();
    
    return {
        type: 'ForStatement',
        variable: variable.value,
        iterable,
        body
    };
}
```

### **Step 4: Transform to React**

```javascript
transformForStatement(node) {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'Identifier',
                name: node.iterable
            },
            property: {
                type: 'Identifier',
                name: 'map'
            }
        },
        arguments: [
            {
                type: 'ArrowFunctionExpression',
                params: [{
                    type: 'Identifier',
                    name: node.variable
                }],
                body: this.transform(node.body)
            }
        ]
    };
}
```

### **Step 5: Generate JSX**

```javascript
generateForStatement(node) {
    return `${this.generate(node.iterable)}.map((${node.variable}) => ${this.generate(node.body)})`;
}
```

### **Usage Example:**

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

## 3. Async/Await (`lombako`, `leka`)

### **Step 1: Add to Constants**

```javascript
const BEMBA_SYNTAX = {
    // ... existing code ...
    ASYNC: 'lombako',
    AWAIT: 'leka',
    // ... rest ...
};
```

### **Step 2: Add to Parser**

```javascript
parseAsyncFunction() {
    const isAsync = this.check('ASYNC');
    if (isAsync) {
        this.advance();
    }
    
    this.consume('FUNCTION', 'Expected nokuti after lombako');
    // ... parse function ...
    
    return {
        type: 'FunctionDeclaration',
        async: isAsync,
        // ... rest ...
    };
}

parseAwaitExpression() {
    this.consume('AWAIT', 'Expected leka');
    const argument = this.parseExpression();
    return {
        type: 'AwaitExpression',
        argument
    };
}
```

### **Step 3: Transform to React**

```javascript
transformAwaitExpression(node) {
    return {
        type: 'AwaitExpression',
        argument: this.transform(node.argument)
    };
}
```

### **Step 4: Generate JSX**

```javascript
generateAwaitExpression(node) {
    return `await ${this.generate(node.argument)}`;
}
```

### **Usage Example:**

```bemba
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

## 4. Navigation (`ukuya`, `ukubwelela`)

### **Step 1: Add to Constants**

```javascript
const BEMBA_SYNTAX = {
    // ... existing code ...
    ROUTING: {
        navigate: 'ukuya',
        goBack: 'ukubwelela',
        // ... rest ...
    },
    // ... rest ...
};
```

### **Step 2: Add Router Helper**

Create `packages/bembajs-core/src/router-helpers.js`:

```javascript
class RouterHelpers {
    static navigate(path) {
        if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    }
    
    static goBack() {
        if (typeof window !== 'undefined') {
            window.history.back();
        }
    }
    
    static getParams() {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            // Extract params from path
            return this.extractParams(path);
        }
        return {};
    }
    
    static getQuery() {
        if (typeof window !== 'undefined') {
            const search = window.location.search;
            const params = new URLSearchParams(search);
            return Object.fromEntries(params);
        }
        return {};
    }
}

module.exports = RouterHelpers;
```

### **Step 3: Transform Navigation Calls**

Update `packages/bembajs-core/src/transformer.js`:

```javascript
transformNavigationCall(node) {
    if (node.name === 'ukuya') {
        return {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'RouterHelpers' },
                property: { type: 'Identifier', name: 'navigate' }
            },
            arguments: node.arguments
        };
    }
    
    if (node.name === 'ukubwelela') {
        return {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'RouterHelpers' },
                property: { type: 'Identifier', name: 'goBack' }
            },
            arguments: []
        };
    }
}
```

### **Usage Example:**

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

## 📋 **Testing Your Syntax**

### **Test File:**

Create `test-syntax.bemba`:

```bemba
// Test conditionals
fyambaIcipanda('TestConditional', {
    ukusunga: {
        wasalwa: true
    },
    ifiputulwa: {
        ngati (wasalwa) {
            umutwe: 'Wasalwa!'
        } kapena {
            umutwe: 'Tawasalwa'
        }
    }
});

// Test loops
fyambaIcipanda('TestLoop', {
    ukusunga: {
        abantu: ['John', 'Jane']
    },
    ifiputulwa: {
        amabatani: kwa (muntu mu abantu) {
            {
                ilembo: muntu
            }
        }
    }
});

// Test async
fyambaIcipanda('TestAsync', {
    ukusungaKabili: {
        data: null,
        effect: lombako nokuti() {
            const result = leka fetch('/api/data');
            ukuCinja('data', result);
        }
    }
});
```

### **Compile and Test:**

```bash
cd packages/bembajs-core
node dist/cli.js compile test-syntax.bemba
```

---

## 🎯 **Next Steps**

1. ✅ Implement conditionals (`ngati`, `kapena`)
2. ✅ Implement loops (`kwa`)
3. ✅ Implement async/await (`lombako`, `leka`)
4. ✅ Implement navigation (`ukuya`, `ukubwelela`)
5. ✅ Add to VS Code syntax highlighting
6. ✅ Write tests
7. ✅ Update documentation

---

**Start with conditionals - they're the most needed and easiest to implement!**

