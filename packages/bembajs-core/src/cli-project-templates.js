/**
 * Default files for `bemba panga` / `bemba init` templates.
 * Code-style markdown is inlined here (no repo .md under docs/) so `bemba template sync` stays in sync.
 */
const fs = require('fs');
const path = require('path');
const { BEMBA_FOLDERS } = require('./constants');

/** Written to user projects as docs/CODE-STYLE-AND-UI.md — keep aligned with monorepo README § Code style and UI. */
const CODE_STYLE_MARKDOWN = [
    '# Code style and UI (BembaJS starter)',
    '',
    'This Markdown file is **for developers** (optional lint/style notes). It is **not** rendered on your site. Your visible UI comes from `amapeji/*.bemba` and `ifikopo/**/*.bemba`.',
    '',
    'Bemba `.bemba` files are the source of your pages; keep **readable indentation** and **small helpers**. Optional tooling below applies only to `.js` / `.jsx` / `.bsx` you add (scripts, emitted React, etc.).',
    '',
    'Bemba-native keyword aliases are supported in parser/module syntax:',
    '- `leta ... kufuma "..."` (import/from)',
    '- `fumya ca_pamushili ...` (export default)',
    '- `cakosa` / `cilepilibuka` / `icakubika` (const/let/var)',
    '',
    '## Linting JavaScript (optional)',
    '',
    'This template can run **[Standard JS](https://standardjs.com/)** via `bun run lint` on `.js` / `.jsx` / `.bsx` files. Auto-fix: `bun run lint:fix`. It is not required for Bemba pages themselves.',
    '',
    'For team reviews, you may also use **[Google’s JS / HTML / TS guides](https://google.github.io/styleguide/)** as reference.',
    '',
    '## UI — shadcn-like workflow for static sites',
    '',
    '[shadcn/ui](https://ui.shadcn.com/) is not an npm dependency you import: you **copy component source into your app** and own it. The same idea fits Bemba static pages:',
    '',
    '1. **Design tokens** live in `amapeji/umusango.bemba` as `:root` overrides for `--bg`, `--surface`, `--text`, `--accent`, etc. (same names the layout uses).',
    '2. **Reusable blocks** are `pangaIcapaba` partials under `ifikopo/cipanda/`, included with `ingisa: [ \'Name\' ]`.',
    '3. **Tweak in place** — duplicate `StarterCard.bemba`, rename, and edit HTML/CSS without fighting upstream versions.',
    '',
    'For rich **React** UI, use `bemba emit-react` and add [shadcn/ui](https://ui.shadcn.com/) in that Vite/React app (see BembaJS docs).',
    '',
    '## Accessibility',
    '',
    'Use real **headings**, **ARIA** attributes where needed, **visible focus** styles, and **sufficient contrast**. The starter card uses a labelled region as an example.',
    '',
    '## Further reading',
    '',
    '- [What is shadcn/ui?](https://shadcnstudio.com/blog/what-is-shadcn-ui-comprehensive-guide) — copy-to-own model explained',
    '- [BembaJS README](https://github.com/bembajs/bembajs/blob/main/README.md) — full framework documentation',
    ''
].join('\n');

function shellBemba(projectTitle) {
    const title = JSON.stringify(String(projectTitle));
    return `pangaUmusango({
  ishinaLyabusite: ${title},
  inshilaNav: [
    { ilembo: 'Home', inshila: '/' },
    { ilembo: 'About', inshila: '/about' }
  ],
  ilyashiPaMusule: 'Edit amapeji/ and ifikopo/ — docs live in docs/ when you need them.',
  imikalile: \`
    /* Overrides layout defaults (this block is appended after the built-in shell CSS). */
    :root {
      --radius: 0.625rem;
      --bg: #f6f4fc;
      --surface: #ffffff;
      --text: #18181b;
      --muted: #64748b;
      --border: rgba(24, 24, 27, 0.1);
      --accent: #6d28d9;
      --accent-hover: #5b21b6;
      --shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 18px 48px rgba(109, 40, 217, 0.08);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0c0a12;
        --surface: #14121c;
        --text: #f4f4f5;
        --muted: #94a3b8;
        --border: rgba(244, 244, 245, 0.1);
        --accent: #a78bfa;
        --accent-hover: #c4b5fd;
        --shadow: 0 1px 2px rgba(0, 0, 0, 0.35), 0 18px 48px rgba(0, 0, 0, 0.45);
      }
    }
    .hero-banner__backdrop {
      background:
        radial-gradient(120% 80% at 15% 0%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 55%),
        radial-gradient(90% 60% at 85% 20%, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 50%),
        linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%) !important;
    }
    @media (prefers-color-scheme: dark) {
      .hero-banner__backdrop {
        background:
          radial-gradient(120% 80% at 15% 0%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 55%),
          radial-gradient(90% 60% at 85% 20%, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 50%),
          linear-gradient(180deg, color-mix(in srgb, var(--surface) 45%, var(--bg)) 0%, var(--bg) 100%) !important;
      }
    }
    .hero-title {
      letter-spacing: -0.035em;
      line-height: 1.1;
    }
    .hero-lead {
      max-width: 36rem;
      font-size: 1.05rem;
      line-height: 1.65;
    }
    .site-body-wrap {
      width: 100%;
      max-width: 56rem;
      margin: 0 auto;
      padding: 0 clamp(1rem, 4vw, 1.5rem) 2.5rem;
    }
    .site-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .body-section {
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: var(--surface);
      box-shadow: var(--shadow);
      padding: 1.35rem 1.5rem;
    }
    .body-section-title {
      margin-top: 0;
    }
    .bemba-ingisa-root.site-body-wrap {
      padding-top: 0.25rem;
    }
    .bem-card {
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      padding: 1.5rem;
      box-shadow: var(--shadow);
      max-width: min(28rem, 100%);
    }
    .bem-card__title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.5rem;
      letter-spacing: -0.02em;
    }
    .bem-card__desc {
      font-size: 0.875rem;
      color: var(--muted);
      margin: 0 0 1rem;
      line-height: 1.55;
    }
    .bem-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: calc(var(--radius) - 2px);
      font-size: 0.875rem;
      font-weight: 500;
      height: 2.25rem;
      padding: 0 1rem;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, filter 0.15s ease;
    }
    .bem-btn--primary {
      background: var(--accent);
      color: #fff;
    }
    .bem-btn--primary:hover {
      background: var(--accent-hover);
    }
    .bem-btn--secondary {
      background: transparent;
      color: var(--text);
      border-color: var(--border);
    }
    .bem-btn--secondary:hover {
      background: color-mix(in srgb, var(--text) 6%, transparent);
    }
  \`
});
`;
}

function starterCardPartial() {
    return `pangaIcapaba({
  ibeensi: \`
    <section class="bem-card bem-card--starter" role="region" aria-labelledby="starter-card-h">
      <h2 id="starter-card-h" class="bem-card__title">Reusable block</h2>
      <p class="bem-card__desc">
        This card is a <code>pangaIcapaba</code> partial in <code>ifikopo/cipanda/StarterCard.bemba</code>.
        Duplicate it, rename the file, and include it from pages with <code>ingisa</code>.
      </p>
      <div class="bem-card__actions">
        <a class="bem-btn bem-btn--primary" href="/about">About</a>
        <span class="bem-card__hint">Add your own links in <code>ifikopo/cipanda/StarterCard.bemba</code>.</span>
      </div>
    </section>
  \`,
  imikalile: \`
    .bem-card__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
    .bem-card__hint {
      font-size: 0.8125rem;
      color: var(--muted);
      line-height: 1.4;
      max-width: 14rem;
    }
    .bem-card__hint code { font-size: 0.92em; }
    .bem-card--starter code {
      font-size: 0.8em;
      padding: 0.12em 0.4em;
      border-radius: 0.25rem;
      background: color-mix(in srgb, var(--text) 9%, transparent);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
  \`
});
`;
}

function indexPage() {
    return `pangaIpepa('Home', {
  umusangoSite: ee,
  umutwe: 'Your BembaJS site',
  ilyashi: 'A clear layout, shared shell, and design tokens you can tune in umusango.bemba.',
  ifiputulwa: [
    {
      umutwe: 'Get started',
      ilyashi: 'Run the dev server, edit pages under amapeji/, then add partials under ifikopo/cipanda/.',
      amabatani: [
        {
          ilembo: 'About',
          pakuKlikisha: 'window.location.href = "/about"'
        }
      ]
    }
  ],
  imikalile: \`
    /* Page-specific tweaks; shared chrome comes from umusango.bemba */
  \`
});
`;
}

function indexPageUi() {
    return `pangaIpepa('Home', {
  umusangoSite: ee,
  ingisa: [ 'StarterCard' ],
  umutwe: 'Your BembaJS site',
  ilyashi: 'Shell styles in umusango.bemba plus a sample partial show how blocks compose.',
  ifiputulwa: [
    {
      umutwe: 'Get started',
      ilyashi: 'Run the dev server, edit amapeji/, and extend ifikopo/cipanda/StarterCard.bemba or add new partials.',
      amabatani: [
        {
          ilembo: 'About',
          pakuKlikisha: 'window.location.href = "/about"'
        }
      ]
    }
  ],
  imikalile: \`
    /* Page-specific tweaks; shared chrome + starter card come from umusango.bemba and ifikopo/cipanda */
  \`
});
`;
}

function aboutPage() {
    return `pangaIpepa('About', {
  umusangoSite: ee,
  umutwe: 'About',
  ilyashi: 'Same navigation, footer, and CSS variables as the home page — one shell for every route.',
  ifiputulwa: [
    {
      umutwe: 'About this app',
      ilyashi: 'Edit amapeji/about.bemba or add new pages under amapeji/.',
      amabatani: [
        {
          ilembo: 'Go home',
          pakuKlikisha: 'window.location.href = "/"'
        }
      ]
    }
  ],
  imikalile: \`\`
});
`;
}

function buttonComponentBemba() {
    return `fyambaIcipanda('Button', {
  ifyapangwa: {
    ilembo: icishilano,
    pakuKlikisha: nokuti()
  },
  ukwisulula: nokuti() {
    bwelela (
      <ibatani className="button" pakuKlikisha={ici.ifyapangwa.pakuKlikisha}>
        {ici.ifyapangwa.ilembo}
      </ibatani>
    )
  }
});
`;
}

function globalCss(projectName) {
    return `/* Global styles for ${projectName} — prefer tokens in amapeji/umusango.bemba for static pages */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
}
`;
}

function projectReadme(projectName) {
    return `# ${projectName}

A [BembaJS](https://bembajs.dev) application with a shared shell and linting defaults.

## Getting started

\`\`\`bash
bun install
bun run dev
\`\`\`

\`bun run dev\` runs **\`bemba tungulula\`** and starts **Vite** (React SPA from \`amapeji/**/*.bemba\` with \`ukwisulula\`) by default.

\`bun run build\` and \`bun run export\` also use the Vite React build by default. Use \`--legacy-static\` only if you intentionally want the old static HTML compiler path.

(\`npm install\` / \`npm run dev\` work too if you use npm.)

CLI language: interactive **\`bemba panga\`** asks **language first**, then template. Or **\`bemba --lang bem panga …\`**, **\`BEMBA_CLI_LANG=bem\`**, or **\`-t base|ui\`** to skip prompts you do not need.

## Bemba-native aliases

You can author module/declaration syntax in Bemba form:

- \`leta ... kufuma '...'\` = \`import ... from '...'\`
- \`fumya ca_pamushili ...\` = \`export default ...\`
- \`cakosa\` / \`cilepilibuka\` / \`icakubika\` = \`const\` / \`let\` / \`var\`

## Code style and UI patterns

Optional local notes: **\`docs/CODE-STYLE-AND-UI.md\`** (linting for \`.js\` you add, tokens, partials). **Full docs:** [github.com/bembajs/bembajs — README](https://github.com/bembajs/bembajs/blob/main/README.md) and [RELEASES.md](https://github.com/bembajs/bembajs/blob/main/RELEASES.md).

## Stay in sync with the scaffold

**New projects** (\`bemba panga …\`) already copy the latest starter from your installed **bembajs** / **bembajs-core** — you do **not** run \`template sync\` for each new app. Use sync only for an **existing** folder after upgrading the CLI, or to pull doc/starter updates without re-scaffolding.

After upgrading **bembajs-core**, run \`bunx bemba template sync\` to refresh \`docs/CODE-STYLE-AND-UI.md\`. Add \`--starter\` only if you want default shell/pages/README replaced (**overwrites** your edits).

## Project structure

- \`${BEMBA_FOLDERS.PAGES}/\` — Pages (\`pangaIpepa\`), including \`umusango.bemba\` shell
- \`${BEMBA_FOLDERS.COMPONENTS}/\` — \`fyambaIcipanda\` modules and \`pangaIcapaba\` partials (\`cipanda/\` recommended)
- \`${BEMBA_FOLDERS.PUBLIC}/\` — Static assets
- \`${BEMBA_FOLDERS.API}/\` — API routes
- \`${BEMBA_FOLDERS.STYLES}/\` — Extra CSS
`;
}

function projectCodeStyleMarkdown() {
    return CODE_STYLE_MARKDOWN;
}

function gitignoreContent() {
    return `node_modules/
dist/
out/
.DS_Store
*.log
.env
.env.local
.env.*.local
`;
}

function viteConfigMjs() {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePluginBemba } from 'bembajs-core/vite-plugin-bemba.js';

export default defineConfig({
  plugins: [vitePluginBemba(), react({ include: [/\\.[jt]sx$/, /\\.bsx$/] })],
  esbuild: {
    include: /src\\/.*\\.(jsx|bsx|tsx|js|ts)$/,
    loader: 'jsx'
  },
  resolve: {
    extensions: ['.bemba', '.bsx', '.jsx', '.js', '.tsx', '.ts', '.json']
  },
  server: { port: 3000 },
  build: { outDir: 'dist' }
});
`;
}

function indexHtml(projectTitle) {
    const t = JSON.stringify(String(projectTitle || 'BembaJS'));
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.slice(1, -1)}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.bsx"></script>
</body>
</html>
`;
}

function mainJsx() {
    return `import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { globKeyToPageRoute } from 'bembajs-core';

const pages = import.meta.glob('../amapeji/**/*.bemba', { eager: true });

function App() {
  const routes = [];
  for (const [key, mod] of Object.entries(pages)) {
    const routePath = globKeyToPageRoute(key);
    if (routePath == null || !mod.default) continue;
    const Comp = mod.default;
    routes.push(<Route key={routePath} path={routePath} element={<Comp />} />);
  }
  return (
    <Routes>
      {routes}
      <Route
        path="*"
        element={
          <div style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
            <p>
              No route matched. Add <code>ukwisulula</code> to a page under <code>amapeji/</code>, or open{' '}
              <a href="/react-demo">/react-demo</a> for a sample React route.
            </p>
          </div>
        }
      />
    </Routes>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
`;
}

function reactDemoPage() {
    return `pangaIpepa('ReactDemo', {
  ukwisulula: nokuti() {
    bwelela (
      <icipandwa className="bemba-react-demo" style={{ padding: '2rem', maxWidth: '42rem', margin: '0 auto' }}>
        <umutwe_ukulu>Vite + React</umutwe_ukulu>
        <ukulondolola style={{ marginTop: '0.75rem', lineHeight: 1.6 }}>
          This file is <code>amapeji/react-demo.bemba</code> → <code>/react-demo</code>.
          Use <code>ukwisulula</code> for SPA routes. Build with <code>bemba akha</code> or <code>bemba fumya</code>{' '}
          (both run Vite by default).
        </ukulondolola>
      </icipandwa>
    )
  }
});
`;
}

function editorConfigContent() {
    return `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
`;
}

/**
 * Write scaffold files. scope `docs` updates only docs/CODE-STYLE-AND-UI.md (inlined in this module).
 * scope `all` writes the full starter set (same as `bemba panga` / `bemba init` template files).
 *
 * @param {string} projectPath
 * @param {string} projectName
 * @param {{ template?: string, scope?: 'docs' | 'all' }} options
 */
function writeProjectTemplateFiles(projectPath, projectName, options = {}) {
    const template = String(options.template || 'base').toLowerCase();
    if (template !== 'base' && template !== 'ui') {
        throw new Error(`Unknown template "${template}". Use base or ui`);
    }
    const isUiTemplate = template === 'ui';
    const scope = options.scope === 'docs' ? 'docs' : 'all';

    fs.mkdirSync(path.join(projectPath, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(projectPath, 'docs', 'CODE-STYLE-AND-UI.md'), projectCodeStyleMarkdown());

    if (scope === 'docs') {
        return;
    }

    fs.mkdirSync(path.join(projectPath, BEMBA_FOLDERS.PAGES), { recursive: true });
    fs.mkdirSync(path.join(projectPath, BEMBA_FOLDERS.COMPONENTS), { recursive: true });
    fs.mkdirSync(path.join(projectPath, BEMBA_FOLDERS.STYLES), { recursive: true });

    fs.writeFileSync(path.join(projectPath, BEMBA_FOLDERS.PAGES, 'umusango.bemba'), shellBemba(projectName));
    if (isUiTemplate) {
        const cipandaDir = path.join(projectPath, BEMBA_FOLDERS.COMPONENTS, 'cipanda');
        fs.mkdirSync(cipandaDir, { recursive: true });
        fs.writeFileSync(path.join(cipandaDir, 'StarterCard.bemba'), starterCardPartial());
    }
    fs.writeFileSync(
        path.join(projectPath, BEMBA_FOLDERS.PAGES, 'index.bemba'),
        isUiTemplate ? indexPageUi() : indexPage()
    );
    fs.writeFileSync(path.join(projectPath, BEMBA_FOLDERS.PAGES, 'about.bemba'), aboutPage());
    fs.writeFileSync(path.join(projectPath, BEMBA_FOLDERS.COMPONENTS, 'Button.bemba'), buttonComponentBemba());
    fs.writeFileSync(path.join(projectPath, BEMBA_FOLDERS.STYLES, 'global.css'), globalCss(projectName));
    fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignoreContent());
    fs.writeFileSync(path.join(projectPath, '.editorconfig'), editorConfigContent());
    fs.writeFileSync(path.join(projectPath, 'README.md'), projectReadme(projectName));

    fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
    fs.writeFileSync(path.join(projectPath, 'vite.config.mjs'), viteConfigMjs());
    fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtml(projectName));
    fs.writeFileSync(path.join(projectPath, 'src', 'main.bsx'), mainJsx());
    fs.writeFileSync(path.join(projectPath, BEMBA_FOLDERS.PAGES, 'react-demo.bemba'), reactDemoPage());
}

module.exports = {
    shellBemba,
    starterCardPartial,
    indexPage,
    indexPageUi,
    aboutPage,
    buttonComponentBemba,
    globalCss,
    projectReadme,
    projectCodeStyleMarkdown,
    writeProjectTemplateFiles,
    gitignoreContent,
    editorConfigContent,
    BEMBA_FOLDERS
};
