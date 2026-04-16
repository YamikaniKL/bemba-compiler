# BembaJS

<div align="center">

![BembaJS Logo](https://ik.imagekit.io/1umfxhnju/bemba-logo.svg?updatedAt=1761557358350)

**A Next.js-like framework for programming in the Bemba language**

**Current line: v1.3.x** — syntax expansion, React integration, static sites, and CLI tooling. **All framework documentation for this repo lives in this file and in [RELEASES.md](RELEASES.md)** (plus the VS Code extension’s `README.md` / `CHANGELOG.md` for the marketplace). Scaffolded apps still receive **`docs/CODE-STYLE-AND-UI.md`** from the CLI.

[![npm version](https://badge.fury.io/js/bembajs.svg)](https://www.npmjs.com/package/bembajs)
[![npm downloads](https://img.shields.io/npm/dm/bembajs.svg)](https://www.npmjs.com/package/bembajs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue)](https://marketplace.visualstudio.com/items?itemName=bembajs.bembajs-language-support)

*Programming in Bemba Language - Now with Full React Integration!*

</div>

---

## Highlights (v1.3.x)

- **Control flow in Bemba** — `ngati` / `kapena`, `kwa` / `pamene`, `linga` / `kwata` / `paumalilo`, `lombako` / `leka` (see [RELEASES.md](RELEASES.md#v130--syntax-expansion-and-chakra-ui)).
- **React and npm** — `ingisa` / `fumya`; wrappers for Chakra UI, Shadcn-style, MUI-style usage.
- **CLI** — React-first: `bemba tungulula` (Vite dev when configured), `bemba akha` / `bemba fumya` (Vite build/export defaults), `bemba static-export` (legacy static HTML), `bemba emit-react`, `bemba template sync`, optional **`--lang bem`** / **`BEMBA_CLI_LANG=bem`**.
- **Static sites** — `amapeji/umusango.bemba` shared shell, `ingisa` partials / `pangaIcapaba`, sitemap & RSS when `baseUrl` / `BEMBA_SITE_URL` is set.
- **Single documentation home** — this file plus [RELEASES.md](RELEASES.md) (version history). Generated apps still get a short **`docs/CODE-STYLE-AND-UI.md`** copy from the CLI.

---

## Quick start

### Create a project

```bash
bun create bembajs@latest my-app
cd my-app
bun install
bun run dev
```

`bun run dev` runs **`bemba tungulula`** (same as calling it directly). Open [http://localhost:3000](http://localhost:3000).

You can also scaffold with **`bemba panga my-app`** (interactive template: `base`, `ui`, …).

### Build, start (production SSR), and export

```bash
bemba akha          # production build → ./dist (includes dist/server.mjs for SSR)
node dist/server.mjs # start production SSR server
bemba fumya         # export React build output → ./out
bemba static-export # legacy static HTML export path
bemba emit-react    # JSX under dist/bemba-react for Vite / esbuild + React
```

Build/export options include `--base-url`, `--locale`, `--site-title`, `--no-bemba-site` (see [RELEASES.md](RELEASES.md)).

### Using React libraries

```bash
bun add @chakra-ui/react @mui/material
```

```bemba
ingisa { Button, Box } ukufuma '@chakra-ui/react'
ingisa { TextField } ukufuma '@mui/material/TextField'
```

---

## Features

- **File-based routing** — pages under `amapeji/`, components under `ifikopo/`
- **`pangaApi` routes** — Node handlers from `mafungulo/*.bemba` (mounted at `/api` in the core dev server)
- **React-first app flow** — Next-like App Router in `amapeji/app/**` with `layout.bemba`, `loading.bemba`, `not-found.bemba`, SSR + hydration via Injini (Vite)
- **Legacy static HTML sites** — `pangaIpepa` + optional `umusangoSite: ee` and `amapeji/umusango.bemba` shell via `bemba static-export`
- **Partials** — `ingisa` + `pangaIcapaba`, optional `NavBar` header merge, top-of-file `import` of `.bemba`
- **State and effects** — `ukusunga`, `ukusungaKabili`, `ukuCinja`
- **Control flow** — conditionals, loops, try/catch/finally, async/await (Bemba keywords)
- **Events and forms** — `pakuKlikisha`, `pakuLemba`, `pakuTumina`, and related handlers
- **Props** — `ificingilila` with types, defaults, and validation
- **React and npm** — `ingisa` / `fumya`; UI library wrappers (e.g. Chakra, MUI, Shadcn-style)
- **`bemba emit-react`** — emit JSX for bundlers; **`exportStaticHtmlSite`** for plain HTML
- **Tooling** — VS Code extension, hot reload, optional experimental **Go** engine bridge in core
- **Localized errors** — error categories and messages available in Bemba

---

## CLI reference

Commands (**`bemba`** or **`bunx bembajs`**):

```bash
bemba panga <name>       # New project (interactive template base|ui, or --template / -t)
bemba tungulula          # Dev server (matches bun run dev in scaffolded apps)
bemba akha               # Production React/Vite build → ./dist
bemba fumya              # Export build output → ./out
bemba static-export      # Legacy static HTML export → ./out
bemba emit-react         # Emit JSX for Vite/esbuild + React (default out: dist/bemba-react)
bemba lint               # Lint .bemba sources
bemba format             # Format .bemba sources
bemba template sync      # Refresh docs/starter from installed core (--starter overwrites shell/pages/README)
bemba --version
bemba help
```

**Build/export flags:** `--base-url` or `BEMBA_SITE_URL`, `--locale` (`<html lang>`), `--site-title` (RSS), `--no-bemba-site` (skip `bemba-site.js`).

**CLI language:** `bemba --lang bem` / `-l bem` or `BEMBA_CLI_LANG=bem` (default English; applies to **bembajs** and **bembajs-core** CLIs).

## Programmatic usage (`bembajs` package)

```javascript
import { compile, createDevServer, build } from 'bembajs';

const result = compile("pangaIpepa('Home', { umutwe: 'Hi', ilyashi: '…' });");
if (result.success) console.log(result.code);
else console.error(result.error);

const server = await createDevServer({ port: 3000, watch: true });
await build({ output: 'dist' });
```

## Code style and UI (starter projects)

Scaffolded apps include **[Standard JS](https://standardjs.com/)** via **`bun run lint`** and **`bun run lint:fix`** for any **`.js` / `.jsx`** you add. Optional reading: [Google style guides](https://google.github.io/styleguide/) (JS, HTML/CSS, TS).

**shadcn-like static UI:** tokens and **`.bem-card` / `.bem-btn`** patterns live in **`amapeji/umusango.bemba`**; the **`ui`** template adds **`ifikopo/cipanda/StarterCard.bemba`** to copy and adapt like [shadcn/ui](https://ui.shadcn.com/) ([overview](https://shadcnstudio.com/blog/what-is-shadcn-ui-comprehensive-guide)).

The CLI writes **`docs/CODE-STYLE-AND-UI.md`** into new/synced projects (short local notes); the canonical narrative is maintained in **`cli-project-templates.js`** (`CODE_STYLE_MARKDOWN`) and summarized here.

## Compiler and core API (`bembajs-core`)

<details>
<summary><strong>compile, static HTML, export, partials, dev server</strong></summary>

### `compile(code, options)`

Pipeline: **tokenize → parse → transform → generate**. Returns **`{ success, code }`** (or error information). Notable options: **`legacyFallback: false`**, **`engine: 'go'`** (optional **`goBinary`**; falls back to JS), and for **`pangaIpepa`** / static HTML: **`projectRoot`**, **`currentPath`**, **`pageFilePath`**, **`layoutCode`**, **`htmlLang`**, **`headExtra`**, **`bembaSiteScript`**.

### Static layout (`umusangoSite: ee`)

| Location | Fields |
|----------|--------|
| Each page | `umusangoSite: ee` plus page content |
| `amapeji/umusango.bemba` | `ishinaLyabusite`, `ilyashiPaMusule`, `inshilaNav`, optional `inshilaCipali`, `ifiputulwaPaMusule`, `ilyashiLupwaPaMusule`, `amalinkaLupwaPaMusule` |

Place **`inshilaNav` before `ifiputulwaPaMusule`**. Pass **`projectRoot`** and **`currentPath`** when compiling so the shell and active nav resolve correctly.

### Design tokens

**`:root`** variables include **`--bg`**, **`--surface`**, **`--text`**, **`--muted`**, **`--border`**, **`--accent`**, **`--accent-hover`**. Primary/outline actions use **`.ibatani`** and **`.ibatani.secondary`**.

### `exportStaticHtmlSite`

Walks **`amapeji/`**, emits HTML, copies **`amashinda/`** and **`maungu/`** when present, optionally writes **sitemap.xml** / **feed.xml** and **`bemba-site.js`**.

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

### Meta / RSS helpers

**`buildHeadMetaTags`**, **`generateSitemapXml`**, **`generateRssFeedXml`** — build a head fragment and pass it as **`compile(..., { headExtra })`**.

### `listStaticPageDependencyPaths(code, { projectRoot, pageFilePath, transitive? })`

Sorted absolute paths to **`.bemba`** files the static HTML for a page depends on (page, **`umusango.bemba`**, **`ingisa`** targets, top-of-file **`import`**). Used with file mtimes for dev-server HTML caching. **`BembaParser.resolveIngisaPartialFilePath(projectRoot, name)`** resolves a single partial the same way **`ingisa`** does.

### Partials (`ingisa` + `pangaIcapaba`)

**`ingisa: [ 'Card', 'Promo' ]`** loads **`ifikopo/<Name>.bemba`** or **`ifikopo/cipanda/<Name>.bemba`**. **`NavBar`** merges into the header (**`{{BEMBA_NAV_BRAND}}`**, **`{{BEMBA_NAV_LINKS}}`**). Top-of-file **`import './x.bemba'`** requires **`pageFilePath`**. **`fyambaIcipanda`-only** modules are skipped in static HTML unless consumed appropriately; use **`pangaApi`** or **`emit-react`** for dynamic stacks.

### `bemba emit-react`

Emits **`.jsx`** from **`amapeji/`**, **`ifikopo/`** (recursive), **`maapi/`**, **`mafungulo/`**; skips **`pangaIcapaba`-only** partials; rewrites **`import … .bemba`** to **`.jsx`**.

### Dev server (`bemba tungulula`)

**`pangaIpepa`** pages are compiled per request with **`projectRoot`** / **`currentPath`**. **`pangaApi`** files under **`mafungulo/`** mount at **`/api`** (e.g. **`hello.bemba` → `/api/hello`**), handlers run under **`vm`** with real **`require()`**. **`amapeji/umusango.bemba`** is shell-only (not a page route).

#### Injini (Vite) error pages in Bemba

If you run the CLI with **`--lang bem`** (or set **`BEMBA_CLI_LANG=bem`**), Injini dev SSR errors render as a readable **Bemba** HTML error page (what failed, where, code frame, stack trace).

### Pipeline helpers

**`parse(code)`**, **`transform(ast)`**, **`generate(ast)`**. Constants **`BEMBA_KEYWORDS`**, **`BEMBA_FOLDERS`**.

</details>

---

## React Integration

### Using React Component Libraries

```bemba
// Import React libraries
ingisa React ukufuma 'react'
ingisa { Button } ukufuma '@shadcn/ui'
ingisa { TextField } ukufuma '@mui/material/TextField'

fyambaIcipanda('MyApp', {
    ukusunga: {
        izina: '',
        email: ''
    },
    ifiputulwa: {
        ifikopo: [
            {
                name: 'TextField',
                library: 'mui',
                props: {
                    label: 'Lemba izina',
                    pakuLemba: 'ukuCinja("izina", event.target.value)',
                    variant: 'outlined'
                }
            },
            {
                name: 'Button',
                library: 'shadcn',
                props: {
                    pakuKlikisha: 'londolola("Submitted!")',
                    imikalile: 'bg-blue-500 hover:bg-blue-700'
                },
                ifika: 'Submit'
            }
        ]
    }
});
```

### Using NPM Packages

```bemba
// Import npm packages
ingisa axios ukufuma 'axios'
ingisa dayjs ukufuma 'dayjs'

fyambaIcipanda('DataComponent', {
    ukusungaKabili: {
        data: [],
        loading: true,
        effect: `
            axios.get('/api/data')
                .then(response => {
                    ukuCinja('data', response.data);
                    ukuCinja('loading', false);
                });
        `
    },
    ifiputulwa: {
        ilyashi: loading ? 'Loading...' : 'Data loaded: ' + data.length + ' items'
    }
});
```

### Mixed React and BembaJS

```bemba
// Pure React component
function ReactCounter({ initialCount = 0 }) {
    const [count, setCount] = useState(initialCount);
    return <div>Count: {count}</div>;
}

// BembaJS component using React component
fyambaIcipanda('MixedExample', {
    ifiputulwa: {
        ifikopo: [
            {
                name: 'ReactCounter',
                props: { initialCount: 5 }
            }
        ]
    }
});
```

---

## Language Syntax Reference

<details>
<summary><strong>Basic Syntax - Pages, Components & API Routes</strong></summary>

### Creating Pages (`pangaIpepa`)

```bemba
pangaIpepa('Home', {
    umutwe: 'Page Title',
    ilyashi: 'Page description with <a href="#">inline HTML</a>',
    ifiputulwa: [
        {
            umutwe: 'Section Title',
            ilyashi: 'Section content',
            amalembelo: [
                'Step one',
                'Step two',
                'Step three'
            ],
            amabatani: [
                {
                    ilembo: 'Button Text',
                    pakuKlikisha: 'londolola("Hello!")'
                }
            ]
        }
    ]
});
```

### Creating Components (`fyambaIcipanda`)

```bemba
fyambaIcipanda('ComponentName', {
    ificingilila: {
        izina: { type: 'string', required: true },
        umaka: { type: 'number', default: 0 }
    },
    ifiputulwa: {
        umutwe: props.izina,
        ilyashi: `Age: ${props.umaka} years old`
    }
});
```

### Creating API Routes (`pangaApi`)

```bemba
pangaApi('users', {
    method: 'GET',
    handler: `
        return {
            status: 200,
            data: { message: 'Hello from BembaJS API' }
        };
    `
});
```

### Import/Export (`ingisa`/`fumya`)

```bemba
// Import React libraries
ingisa React ukufuma 'react'
ingisa { useState, useEffect } ukufuma 'react'

// Import UI components
ingisa { Button } ukufuma '@shadcn/ui'
ingisa { TextField } ukufuma '@mui/material/TextField'

// Import npm packages
ingisa axios ukufuma 'axios'
ingisa dayjs ukufuma 'dayjs'

// Export components
fumya chisangwa MyComponent
```

</details>

<details>
<summary><strong>State Management</strong></summary>

### Basic State (`ukusunga`)

```bemba
fyambaIcipanda('Counter', {
    ifiputulwa: {
        ukusunga: {
            namba: 0,
            izina: '',
            wasalwa: false
        },
        amabatani: [
            {
                ilembo: 'Onjela: ' + namba,
                pakuKlikisha: 'ukuCinja("namba", namba + 1)'
            }
        ]
    }
});
```

### State with Effects (`ukusungaKabili`)

```bemba
fyambaIcipanda('DataComponent', {
    ifiputulwa: {
        ukusungaKabili: {
            data: [],
            loading: true,
            effect: `
                fetch('/api/data')
                    .then(res => res.json())
                    .then(data => {
                        ukuCinja('data', data);
                        ukuCinja('loading', false);
                    });
            `
        }
    }
});
```

### State Updates (`ukuCinja`)

```bemba
// Update single state
ukuCinja('namba', namba + 1)

// Update multiple states
ukuCinja('izina', 'John')
ukuCinja('wasalwa', true)
```

</details>

<details>
<summary><strong>Event Handling</strong></summary>

### Click Events (`pakuKlikisha`)

```bemba
amabatani: [
    {
        ilembo: 'Click Me',
        pakuKlikisha: 'londolola("Button clicked!")'
    }
]
```

### Input Events (`pakuLemba`)

```bemba
inputs: [
    {
        type: 'text',
        placeholder: 'Lemba izina',
        pakuLemba: 'ukuCinja("izina", event.target.value)'
    }
]
```

### Form Events (`pakuTumina`)

```bemba
forms: [
    {
        pakuTumina: `
            event.preventDefault();
            londolola('Form submitted!');
        `
    }
]
```

### Other Events

- `pakuCinja` - Select change events
- `pakuIngia` - Focus events
- `pakuFuma` - Blur events
- `pakuKwesha` - Mouse enter events
- `pakuSiya` - Mouse leave events

</details>

<details>
<summary><strong>Component Props & Validation</strong></summary>

### Props Definition (`ificingilila`)

```bemba
fyambaIcipanda('UserCard', {
    ificingilila: {
        izina: { 
            type: 'string', 
            required: true 
        },
        umaka: { 
            type: 'number', 
            default: 0 
        },
        ifoto: { 
            type: 'string' 
        },
        wasalwa: {
            type: 'boolean',
            default: false
        }
    },
    ifiputulwa: {
        umutwe: props.izina,
        ilyashi: `Age: ${props.umaka} years old`
    }
});
```

### Prop Types

- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values
- `array` - List of items
- `object` - Key-value pairs
- `function` - Callback functions

</details>

<details>
<summary><strong>Styling</strong></summary>

### CSS Styles (`imikalile`)

```bemba
fyambaIcipanda('StyledComponent', {
    ifiputulwa: {
        umutwe: 'Styled Component'
    },
    imikalile: `
        .component {
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .component h1 {
            color: #333;
            margin: 0 0 16px 0;
        }
    `
});
```

### Tailwind CSS Integration

BembaJS includes Tailwind CSS by default for utility-first styling.

</details>

<details>
<summary><strong>Forms & Validation</strong></summary>

### Form Handling

```bemba
fyambaIcipanda('ContactForm', {
    ifiputulwa: {
        ukusunga: {
            izina: '',
            email: '',
            message: '',
            emailError: ''
        },
        forms: [
            {
                inputs: [
                    {
                        type: 'text',
                        name: 'izina',
                        placeholder: 'Lemba izina lyobe',
                        pakuLemba: 'ukuCinja("izina", event.target.value)',
                        required: true
                    },
                    {
                        type: 'email',
                        name: 'email',
                        placeholder: 'Email yobe',
                        pakuLemba: `
                            ukuCinja('email', event.target.value);
                            if (!event.target.value.includes('@')) {
                                ukuCinja('emailError', 'Email yakufwile kuba na @');
                            } else {
                                ukuCinja('emailError', '');
                            }
                        `,
                        required: true
                    }
                ],
                pakuTumina: `
                    event.preventDefault();
                    londolola('Form submitted successfully!');
                `
            }
        ]
    }
});
```

### Input Types

- `text` - Text input
- `email` - Email input
- `password` - Password input
- `number` - Number input
- `textarea` - Multi-line text
- `checkbox` - Checkbox input
- `radio` - Radio button
- `select` - Dropdown select

</details>

<details>
<summary><strong>Data Fetching</strong></summary>

### Fetch API Integration

```bemba
fyambaIcipanda('DataComponent', {
    ifiputulwa: {
        ukusungaKabili: {
            data: [],
            loading: true,
            error: null,
            effect: `
                fetch('/api/users')
                    .then(res => res.json())
                    .then(data => {
                        ukuCinja('data', data);
                        ukuCinja('loading', false);
                    })
                    .catch(error => {
                        ukuCinja('error', error.message);
                        ukuCinja('loading', false);
                    });
            `
        }
    }
});
```

### API Routes

```bemba
pangaApi('users', {
    method: 'GET',
    handler: `
        const users = [
            { izina: 'John', umaka: 25 },
            { izina: 'Jane', umaka: 30 }
        ];
        
        return {
            status: 200,
            data: users
        };
    `
});
```

</details>

<details>
<summary><strong>Built-in Functions</strong></summary>

### Console Functions

```bemba
londolola('Hello World!')           // console.log
londololaError('Error occurred')     // console.error
londololaWarning('Warning message')  // console.warn
```

### String Functions

```bemba
ukuPima('Hello')           // string.length
ukuPindula('a', 'b')       // string.replace
ukuGawanya('a,b,c')        // string.split
ukuSanganya(['a','b','c']) // array.join
```

### Array Functions

```bemba
ukuOnjela(array, item)     // array.push
ukuCotola(array, index)    // array.splice
ukuPindula(array, fn)      // array.map
ukuSankha(array, fn)       // array.filter
```

### Math Functions

```bemba
ukuBalisha(a, b)           // addition
ukuCepula(a, b)            // subtraction
ukuCilisha(a, b)           // multiplication
ukuGawanya(a, b)           // division
```

</details>

---

## VS Code Support

### Automatic installation

```bash
bun add -g bembajs@latest
bemba install-ide   # VS Code language support, if available in your CLI version
```

### Manual Installation

1. Install the [BembaJS Language Support](https://marketplace.visualstudio.com/items?itemName=bembajs.bembajs-language-support) extension
2. Open any `.bemba` file
3. Enjoy syntax highlighting and snippets!

### Features

- Syntax highlighting for Bemba keywords
- Code snippets for common patterns
- File association for `.bemba` files
- Custom icon for Bemba files
- Auto-completion and bracket matching

---

## Project structure

Default Bemba folder names (override in `bemba.config.js` → `folders` if needed):

```
my-app/
├── amapeji/           # Pages (file-based routing); optional umusango.bemba (site shell)
│   └── app/            # App Router (Next-like): layout.bemba, page.bemba, loading.bemba, not-found.bemba
├── ifikopo/           # Components (optional ifikopo/cipanda/ for partials)
├── mafungulo/         # API routes (pangaApi) — mounted at /api
├── amashinda/         # Static assets (served under /amashinda in dev)
├── maungu/            # Extra public/static files (used by export tooling when present)
├── imikalile/         # Global styles
├── docs/              # CODE-STYLE-AND-UI.md (written by bemba panga / template sync)
├── bemba.config.js
└── package.json
```

Scaffolded apps may use different folder keys in `bemba.config.js` (e.g. `api: 'maapi'`). The **bembajs-core** dev server follows **`BEMBA_FOLDERS`** in code (API default **`mafungulo`**); align your on-disk folder with that or adjust config once core reads it everywhere.

---

## Configuration

### bemba.config.js

```javascript
module.exports = {
    // Development server port
    port: 3000,
    
    // Build output directory
    output: './dist',
    
    // Enable hot reload
    hotReload: true,
    
    // Open browser automatically
    openBrowser: true,
    
    // API server port
    apiPort: 3001,
    
    // Enable static site generation
    ssg: false,
    
    // Enable server-side rendering
    ssr: true,
    
    // Build optimizations
    optimize: true,
    
    // Routing configuration
    routing: {
        trailingSlash: false,
        caseSensitive: false
    }
};
```

---

## Error Messages

BembaJS provides error messages in the Bemba language:

- **Syntax Errors**: `Ifipushi fya syntax: [error details]`
- **Runtime Errors**: `Ifipushi fya kutantika: [error details]`
- **Validation Errors**: `Ifipushi fya kupepesha: [error details]`
- **Component Errors**: `Ifipushi fya component: [error details]`
- **API Errors**: `Ifipushi fya API: [error details]`

---

## Examples

In this repo, see the [`examples/`](https://github.com/bembajs/bembajs/tree/main/examples) folder (e.g. `syntax-expansion.bemba`, `shadcn-integration.bemba`, `state-management.bemba`, `full-app/`).

---

## Contributing

Issues and pull requests are welcome on **[github.com/bembajs/bembajs](https://github.com/bembajs/bembajs)** (this monorepo).

### Monorepo setup

The repo expects **pnpm** for workspaces (`package.json` `engines`).

```bash
git clone https://github.com/bembajs/bembajs.git
cd bembajs
pnpm install
pnpm run build
pnpm test
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

- **Releases and changelog narrative**: [RELEASES.md](RELEASES.md)
- **Documentation**: [docs.bembajs.dev](https://docs.bembajs.dev) and this repository’s **README.md** / **RELEASES.md**
- **Issues**: [github.com/bembajs/bembajs/issues](https://github.com/bembajs/bembajs/issues)

---

<div align="center">

**Made with ❤️ for the Bemba-speaking developer community**

[Website](https://bembajs.dev) • [Documentation](https://docs.bembajs.dev) • [Releases](RELEASES.md)

</div>