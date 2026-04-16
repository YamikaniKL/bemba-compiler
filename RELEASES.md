# BembaJS releases

Human-readable history and highlights. Published package versions are defined in each package’s `package.json`.

## Current published versions (monorepo snapshot)

| Package | Role |
|--------|------|
| **bembajs** | CLI (`bemba`), dev server wiring, React emit, npm entrypoint |
| **bembajs-core** | Lexer, parser, transformer, generator, static HTML export, API route compilation |
| **create-bembajs** | `create bembajs` / project scaffolding |
| **bembajs-vscode-extension** | Syntax, snippets, grammar (see package `CHANGELOG.md`) |

Install or upgrade the CLI (recommended):

```bash
bun add -g bembajs
```

Create a project:

```bash
bun create bembajs@latest my-app
# or: bemba panga my-app
```

---

## Platform highlights (1.3.x line)

These ship across recent **1.3.x** releases and sit on top of the v1.3.0 language work below.

### CLI and developer workflow

#### React-first command model (latest 1.3.x)

- **`bemba tungulula`** runs **Vite** by default when `vite.config.*` is present and `framework.reactApp !== false`.
- **Dev SSR (Injini):** when `framework.reactSsrDev !== false`, pages render through Vite SSR and hydrate on the client (Next-like app flow).
- **`bemba akha`** builds production with **Vite** by default.
- **Production SSR:** `bemba akha` also emits a runnable **`dist/server.mjs`** (SSR server) alongside the client bundle.
- **`bemba fumya`** also exports via **Vite** by default (output folder oriented).
- **Legacy static HTML** is now explicit: **`bemba static-export`** (or older compatibility flows where enabled).
- **`vite-plugin-bemba`** is published from `bembajs-core` and compiles `.bemba` directly in Vite projects.
- **`vite-plugin-bemba`** now also handles `.bsx` source transforms, and normalizes queried `.bemba` ids before file reads for more reliable Windows/dev-server behavior.
- Scaffolded apps now include **`vite.config.mjs`** plus app-router pages under **`amapeji/app/**/page.bemba`**; Injini manages hidden runtime glue automatically.

- **`bemba tungulula`** — primary dev server (generated apps use this as `bun run dev` / `npm run dev`).
- **`bemba panga` / `bemba init`** — scaffolding with interactive template choice (`base`, `ui`, …).
- **`bemba akha`** / **`bemba fumya`** — React/Vite build defaults; legacy static HTML export remains available via **`bemba static-export`**.
- **`bemba emit-react`** — emit **`.jsx`** from `amapeji/`, `ifikopo/` (recursive), `maapi/`, `mafungulo/` into **`dist/bemba-react/`** for Vite/esbuild + React (skips `pangaIcapaba`-only partials).
- **Hidden glue by default:** new projects no longer require user-managed **`index.html`** or **`src/main.*`**; Injini injects a virtual app entry internally.
- **`bemba lint`** / **`bemba format`** — lint and format Bemba sources.
- **`bemba template sync`** — refresh generated docs/shell from templates (`--starter` overwrites default shell/pages).

Export flags (akha / fumya): **`--base-url`** or **`BEMBA_SITE_URL`**, **`--locale`** for `<html lang>`, **`--site-title`** for RSS, **`--no-bemba-site`** to skip **bemba-site.js**.

### CLI language

- **`bemba --lang bem`** / **`-l bem`** or **`BEMBA_CLI_LANG=bem`** for Bemba CLI strings (default English). Applies to **bembajs** and **bembajs-core** CLIs.

### Static sites and layout

- **`amapeji/umusango.bemba`** — shared shell for **`umusangoSite: ee`** pages: site title, nav, footer columns, legal links, optional **`inshilaCipali`** (utility nav).
- **Design tokens** — `:root` CSS variables (`--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, …) plus **`.ibatani`** / **`.ibatani.secondary`** for consistent buttons.
- **Partials:** **`ingisa: [ 'Name' ]`** resolves **`ifikopo/Name.bemba`** or **`ifikopo/cipanda/Name.bemba`** with **`pangaIcapaba`**. **`NavBar`** partial merges into the header with **`{{BEMBA_NAV_BRAND}}`** / **`{{BEMBA_NAV_LINKS}}`** placeholders.
- **Top-of-file `import … from './path.bemba'`** — resolved when **`pageFilePath`** (and **`projectRoot`**) are set (static HTML and dev server).
- **`listStaticPageDependencyPaths`** — transitive `.bemba` dependency list for accurate static page cache invalidation in dev.

### API routes (dynamic server)

- **`pangaApi`** modules under **`mafungulo/`** (convention in core dev server) — mounted at **`/api`**, handlers run with **`vm`** + Node **`require()`** for real npm modules (DB clients, etc.).

### Compiler options

- **`compile(code, { legacyFallback: false })`** — disable legacy syntax fallback when you want strict mode.
- **`engine: 'go'`** (optional **`goBinary`**) — experimental native bridge with automatic fallback to JS.

### New projects from core

- **`docs/CODE-STYLE-AND-UI.md`** is written into new/synced apps from **bembajs-core** (`cli-project-templates.js`); **Standard JS** via **`bun run lint`** for user **`.js`/`.jsx`**.
- **`.editorconfig`**, **`.gitignore`**, shared **`umusango.bemba`** / optional **StarterCard** (ui template).

**Full CLI, programmatic API, and compiler reference** live in the monorepo **[README.md](README.md)** (single doc home).

---

## v1.3.0 — Syntax expansion and Chakra UI

**Theme:** control flow, async, error handling, Chakra wrappers, VS Code updates.

### Language

- **Conditionals:** `ngati` / `kapena` (if / else, including else-if chains).
- **Loops:** `kwa` (for-in), `pamene` (while).
- **Errors:** `linga` / `kwata` / `paumalilo` (try / catch / finally).
- **Async:** `lombako` (async), `leka` (await).

### UI

- **Chakra UI** component wrapper path (`library: 'chakra'`) alongside existing Shadcn/MUI-style patterns.

### Tooling

- VS Code grammar and snippets for the new keywords and patterns.

---

## v1.2.0 — React integration

**Theme:** treat BembaJS as a React-oriented framework.

- **`ingisa` / `fumya` / `ukufuma`** — import npm and React libraries from `.bemba`.
- **Wrapper registry** — map Bemba props to React (e.g. `pakuKlikisha` → `onClick`, `imikalile` → `className`).
- **Shadcn- and MUI-oriented** wrappers and examples.
- **Pisha** (Vite-based) was introduced in this era for fast `.bemba` HMR; the current CLI still centers on **`bemba tungulula`** and **`emit-react`** for many workflows.

---

## v1.1.0 — “Cisokolola”

**Theme:** state, events, props, utilities, localized errors.

- **`ukusunga`**, **`ukusungaKabili`**, **`ukuCinja`** — state and effects.
- **Rich event** keywords (`pakuKlikisha`, `pakuLemba`, `pakuTumina`, …).
- **`ificingilila`** — typed props with defaults and validation.
- **Built-ins** — `londolola*`, string/array/math helpers.
- **Bemba-language** error categories for syntax, runtime, validation, components, API.

---

## Changelog links

- Repository: [github.com/bembajs/bembajs](https://github.com/bembajs/bembajs)  
- Use **GitHub Compare** or **Tags** for commit-level diffs between versions you care about.
