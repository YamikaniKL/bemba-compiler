# BembaJS Core

[![npm version](https://badge.fury.io/js/bembajs-core.svg)](https://badge.fury.io/js/bembajs-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**BembaJS Core** - The compiler and runtime engine for Bemba language 🇿🇲

## 📦 Installation

```bash
npm install bembajs-core
```

## New projects (`bemba panga` / `bemba init`)

The core CLI generates a **modern static starter**: shared **`amapeji/umusango.bemba`** shell (semantic HSL tokens and `.bem-*` utilities similar to [shadcn/ui](https://ui.shadcn.com/)), **`ifikopo/cipanda/StarterCard.bemba`** (copy-and-edit partial), **[Standard JS](https://standardjs.com/)** via **`bun run lint`**, **`.editorconfig`**, **`.gitignore`**, and **`docs/CODE-STYLE-AND-UI.md`**. The same guide ships in this repo: [docs/CODE-STYLE-AND-UI.md](./docs/CODE-STYLE-AND-UI.md).

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

**Experimental native engine:** set `engine: 'go'` (and optional `goBinary`) to try a Go backend bridge. If the binary is missing or errors, core falls back to the JS engine automatically.

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

### Design tokens (static `pangaIpepa` shell)

The **site layout** CSS (in `BembaParser#generateModernLayout` for `umusangoSite: ee`) defines **`:root`** custom properties. Use them in partial `imikalile` or raw HTML `style=""` so custom components match the shell.

| Token | Role |
|-------|------|
| `--bg` | Page background |
| `--surface` | Surfaces / cards |
| `--text` | Primary text |
| `--muted` | Secondary text |
| `--border` | Hairlines / inputs |
| `--accent` | Primary actions (matches `.ibatani` fill) |
| `--accent-hover` | Primary hover |

**Buttons:** hero and body actions use **`.ibatani`** (primary) and **`.ibatani.secondary`** (outline). Reuse these classes inside **`pangaIcapaba`** HTML for visual consistency.

Dark mode: the same variables are overridden inside `@media (prefers-color-scheme: dark)` in the emitted layout.

### Static HTML compile options (`BembaParser#compile` / legacy `compile()` fallback)

When compiling **`pangaIpepa`** (not the default AST `compile()` success path), pass:

| Option | Purpose |
|--------|---------|
| **`projectRoot`** | Resolves `amapeji/umusango.bemba`, **`ingisa`** partials under `ifikopo/`, and validates import paths stay in the project |
| **`currentPath`** | Request URL path (e.g. `/learn`) for **active** nav link styling |
| **`pageFilePath`** | Absolute path to the page `.bemba` file — **required** for top-of-file **`import … from './relative.bemba'`** |
| **`layoutCode`** | Optional: inline shell source instead of reading `umusango.bemba` from disk |
| **`htmlLang`** | `<html lang="…">` (BCP 47), default `en` — use for **i18n** (`bem`, `en`, …) |
| **`headExtra`** | Trusted HTML fragment inserted in `<head>` after `<title>` (e.g. from **`buildHeadMetaTags()`**) |
| **`bembaSiteScript`** | If true, append `<script src="/bemba-site.js" defer>` before `</body>` (see static export) |

### Static HTML export (`exportStaticHtmlSite`)

From code or CLI (**`bemba fumya`** / **`bemba akha`** in the `bembajs` package, **`bemba fumya`** / **`bemba akha`** in core):

- Walks **`amapeji/`** (non-dynamic routes only), compiles each **`pangaIpepa`** page to **`index.html`** under a folder per URL (e.g. `/learn` → `out/learn/index.html`).
- Copies **`amashinda/`** (and **`maungu/`** if present) into the output tree.
- With **`baseUrl`** (or env **`BEMBA_SITE_URL`**), writes **`sitemap.xml`** and **`feed.xml`** (RSS).
- Copies **`bemba-site.js`** (optional nav toggle hook for **`[data-bemba-nav-toggle]`**) unless you pass **`bembaSiteScript: false`** or **`--no-bemba-site`**.

```javascript
const { exportStaticHtmlSite } = require('bembajs-core');
await exportStaticHtmlSite({
  projectRoot: process.cwd(),
  outDir: 'out',
  baseUrl: 'https://example.com',
  locale: 'bem',
  siteTitle: 'My site'
});
```

### Head meta, sitemap, RSS (pure helpers)

```javascript
const { buildHeadMetaTags, generateSitemapXml, generateRssFeedXml } = require('bembajs-core');
const head = buildHeadMetaTags({
  description: '…',
  canonical: 'https://example.com/page',
  ogTitle: '…',
  ogImage: 'https://example.com/og.png'
});
// Pass as compile(..., { headExtra: head })
```

### `listStaticPageDependencyPaths(code, { projectRoot, pageFilePath, transitive? })`

Returns a sorted list of **absolute paths** to existing `.bemba` files that static HTML for this page depends on: the page itself, **`umusango.bemba`** when `umusangoSite: ee`, each resolved **`ingisa`** file, and each resolved static **`import`**. With **`transitive: true`** (default), also follows **`import`** / **`ingisa`** inside those partials. **bembajs-core** and **bembajs** dev servers use this list with **file mtimes** to invalidate cached HTML per page (no full-cache flush on every save).

```javascript
const { listStaticPageDependencyPaths } = require('bembajs-core');
const fs = require('fs');
const code = fs.readFileSync('amapeji/contact.bemba', 'utf8');
console.log(listStaticPageDependencyPaths(code, {
  projectRoot: process.cwd(),
  pageFilePath: require('path').resolve('amapeji/contact.bemba')
}));
```

`BembaParser` also exposes **`resolveIngisaPartialFilePath(projectRoot, name)`** for resolving a single partial path the same way **`ingisa`** does.

### HTML partials (`ingisa` + `pangaIcapaba`)

- On a **`pangaIpepa`** page, add **`ingisa: [ 'Card', 'Promo' ]`** (names without `.bemba`).
- For each name, the compiler reads **`ifikopo/<Name>.bemba`**, or if missing, **`ifikopo/cipanda/<Name>.bemba`**, containing **`pangaIcapaba({ ibeensi: \`…HTML…\`, imikalile: \`…css…\` })`**.
- **`ibeensi`** is trusted author HTML (not escaped). Partials get a light CSS entrance animation. **`projectRoot`** must be set (dev servers pass it).
- Special name **`NavBar`** (see **`BEMBA_INGISA.NAV_BAR`**): not placed in the body partials region. Its HTML is merged into the **top site header**; placeholders **`{{BEMBA_NAV_BRAND}}`** and **`{{BEMBA_NAV_LINKS}}`** are filled from **`umusango.bemba`** when the page uses **`umusangoSite: ee`** (same data as the built-in navbar).
- **Top-of-file `import`** (parsed like the AST path): **`import NavBar from '../ifikopo/cipanda/NavBar.bemba'`** before **`pangaIpepa`** resolves **`pangaIcapaba`** partials into the layout. Pass **`pageFilePath`** (absolute or project-relative resolved) in **`compile(code, { projectRoot, currentPath, pageFilePath })`** so relative paths work. Default **`fyambaIcipanda`**-only modules are skipped in static HTML; use **`pangaApi`** / **`emit-react`** for dynamic behavior.

### `bemba emit-react` (CLI in `bembajs` package)

Emits **`.jsx`** from **`amapeji/`**, **`ifikopo/`** (recursive, e.g. **`ifikopo/cipanda/`**), **`maapi/`**, and **`mafungulo/`** into **`dist/bemba-react/`** for wiring with **Vite/esbuild + React** (e.g. **framer-motion** in your app). Skips **`pangaIcapaba`-only** partials; **`import … from './X.bemba'`** is rewritten to **`./X.jsx`**. Does not bundle by itself.

### Dynamic dev server (`bemba tungulula` → `DevServer`)

The core **Express** dev server is aimed at **server-rendered, dynamic** behavior:

- **`pangaIpepa` pages** — Each document request runs `BembaParser#compile` with `projectRoot` and `currentPath`, so HTML (including `umusango.bemba`) is produced **on the server**, not as a static export.
- **`pangaApi` routes** under **`mafungulo/`** — Compiled to a Node handler and executed with `vm` + real `require()`, so you can **`require('pg')`**, ORMs, or any npm module inside the `handler` template string. Routes are mounted at **`/api`** (e.g. file `mafungulo/hello.bemba` → `GET /api/hello`).
- **`amapeji/umusango.bemba`** is skipped as a page route (shell only).

React/AST-only pages still use the development preview shell until full `renderToString` SSR exists.

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
