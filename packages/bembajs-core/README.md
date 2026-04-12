# BembaJS Core

[![npm version](https://badge.fury.io/js/bembajs-core.svg)](https://badge.fury.io/js/bembajs-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**BembaJS Core** - The compiler and runtime engine for Bemba language 🇿🇲

## 📦 Installation

```bash
npm install bembajs-core
```

## 🚀 Quick Start

```javascript
const { compile, parse, transform, generate } = require('bembajs-core');

// Compile Bemba code with the full AST pipeline
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
```

## 🔧 API Reference

### `compile(code, options)`

Compiles Bemba code using `tokenize -> parse -> transform -> generate`.

**Parameters:**
- `code` (string) - Bemba source code
- `options` (object) - Compilation options

**Returns:** Compile result object

**Example:**
```javascript
const result = compile(`
  pangaWebusaiti("My App", {
    ifiputulwa: [{
      umutwe: "Welcome",
      ilyashi: "Hello from BembaJS!",
      amabatani: [{
        ilembo: "Click Me",
        pakuKlikisha: "londolola('Hello!')"
      }]
    }]
  });
`);

if (result.success) {
  console.log(result.code);
}
```

**Result shape:**

```javascript
{
  success: true,
  code: "generated output"
}
```

`compile()` keeps a legacy fallback for old syntax by default. You can disable that with:

```javascript
const result = compile(code, { legacyFallback: false });
```

### Static HTML site layout (`pangaIpepa`)

**Per page:** set `umusangoSite: ee` and author `umutwe`, `ilyashi`, `ifiputulwa`, and optional `imikalile` as usual.

**Shared shell (one place):** create `amapeji/umusango.bemba` with `ishinaLyabusite`, `ilyashiPaMusule`, `inshilaNav`, and optional `imikalile` for shell-only CSS. When that file exists, the compiler reads nav and footer from it so every site page stays aligned. Wrap the object in `pangaUmusango({ ... })` for clarity (the call is documentation; fields are what matter).

| Location | Fields |
|----------|--------|
| Each page | `umusangoSite: ee` only (plus page content) |
| `amapeji/umusango.bemba` | `ishinaLyabusite`, `ilyashiPaMusule`, `inshilaNav`: `[{ ilembo, inshila }, …]` |

If `umusango.bemba` is missing, shell fields must live on the same page as `umusangoSite: ee` (single-file demos).

Compile with `projectRoot` so the parser can resolve `amapeji/umusango.bemba`; pass `currentPath` (e.g. request path) for active nav styling.

Hero copy uses top-level `umutwe` / `ilyashi` before `ifiputulwa`; body sections use `ifiputulwa` as usual.

### `parse(code)`

Parses Bemba code into an Abstract Syntax Tree (AST).

**Parameters:**
- `code` (string) - Bemba source code

**Returns:** AST object

**Example:**
```javascript
const ast = parse(`
  fyambaIcipanda('Button', {
    ilembo: 'Click Me',
    pakuKlikisha: 'handleClick()'
  });
`);
```

### `transform(ast)`

Transforms Bemba AST to React-compatible AST.

**Parameters:**
- `ast` (object) - Bemba AST

**Returns:** React-compatible AST

### `generate(ast)`

Generates JavaScript code from AST.

**Parameters:**
- `ast` (object) - React-compatible AST

**Returns:** Generated JavaScript string

## 🏗️ Architecture

BembaJS Core consists of four main components:

### 1. Lexer (`BembaLexer`)
Tokenizes Bemba source code into tokens.

```javascript
const { BembaLexer } = require('bembajs-core');
const lexer = new BembaLexer();
const tokens = lexer.tokenize(code);
```

### 2. Parser (`BembaParser`)
Parses tokens into an Abstract Syntax Tree.

```javascript
const { BembaParser } = require('bembajs-core');
const parser = new BembaParser();
const ast = parser.parse(tokens);
```

### 3. Transformer (`BembaTransformer`)
Transforms Bemba AST to React-compatible AST.

```javascript
const { BembaTransformer } = require('bembajs-core');
const transformer = new BembaTransformer();
const reactAST = transformer.transform(bembaAST);
```

### 4. Generator (`BembaGenerator`)
Generates JavaScript/React code from AST.

```javascript
const { BembaGenerator } = require('bembajs-core');
const generator = new BembaGenerator();
const jsCode = generator.generate(reactAST);
```

## 🎯 Bemba Language Features

### Components
```javascript
fyambaIcipanda('MyComponent', {
  umutwe: 'Component Title',
  ilyashi: 'Component content',
  amabatani: [{
    ilembo: 'Button Text',
    pakuKlikisha: 'handleClick()'
  }]
});
```

### Pages
```javascript
pangaIpepa('Home', {
  umutwe: 'Welcome to BembaJS',
  ilyashi: 'Build amazing web applications'
});
```

### API Routes
```javascript
pangaMaapi('/api/hello', {
  method: 'GET',
  response: 'Hello from BembaJS!'
});
```

### Hooks
```javascript
// State management
const [count, setCount] = useUmubili(0);

// Effects
useMulemba(() => {
  console.log('Component mounted');
}, []);

// Context
const theme = useMukulu('theme');
```

## 🔧 Constants

### Bemba Keywords
```javascript
const { BEMBA_KEYWORDS } = require('bembajs-core');
console.log(BEMBA_KEYWORDS);
// Output: ['fyambaIcipanda', 'pangaIpepa', 'pangaMaapi', ...]
```

### Bemba Folders
```javascript
const { BEMBA_FOLDERS } = require('bembajs-core');
console.log(BEMBA_FOLDERS);
// Output: { pages: 'amapeji', components: 'ifikopo', api: 'maapi', ... }
```

## 🧪 Testing

```bash
npm test
```

## 📖 Examples

### Basic Component
```javascript
const { compile } = require('bembajs-core');

const code = `
  fyambaIcipanda('Welcome', {
    umutwe: 'Mwaiseni ku BembaJS!',
    ilyashi: 'This is a Bemba component',
    amabatani: [{
      ilembo: 'Get Started',
      pakuKlikisha: 'startApp()'
    }]
  });
`;

const result = compile(code);
```

### Form Component
```javascript
const code = `
  fyambaIcipanda('ContactForm', {
    umutwe: 'Contact Us',
    ilyashi: 'Send us a message',
    amabatani: [{
      ilembo: 'Submit',
      pakuKlikisha: 'submitForm()'
    }]
  });
`;
```

## 🔗 Related Packages

- [bembajs](https://www.npmjs.com/package/bembajs) - Main CLI and SDK
- [create-bembajs](https://www.npmjs.com/package/create-bembajs) - Project scaffolding

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/bembajs/bembajs/blob/main/CONTRIBUTING.md).

---

**Made with ❤️ in Zambia 🇿🇲**
