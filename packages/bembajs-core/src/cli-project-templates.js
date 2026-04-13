/**
 * Default files for `bemba panga` / `bemba init` templates.
 * Canonical copy of docs/CODE-STYLE-AND-UI.md lives in this package under docs/; it is read at runtime
 * so one edit propagates to new projects and to `bemba template sync`.
 */
const fs = require('fs');
const path = require('path');
const { BEMBA_FOLDERS } = require('./constants');

/** Package root whether this file lives in src/ or dist/. */
function bembajsCorePackageRoot() {
    return path.resolve(__dirname, '..');
}

/** Single source for CODE-STYLE-AND-UI.md (published in npm package files). */
function loadCodeStyleMarkdownFromPackage() {
    const docPath = path.join(bembajsCorePackageRoot(), 'docs', 'CODE-STYLE-AND-UI.md');
    try {
        return fs.readFileSync(docPath, 'utf8');
    } catch (_) {
        return null;
    }
}

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

(\`npm install\` / \`npm run dev\` work too if you use npm.)

## Code style and UI patterns

Optional reference: **\`docs/CODE-STYLE-AND-UI.md\`** — linting for \`.js\` files you add, UI tokens, and partials workflow.

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
    const fromPkg = loadCodeStyleMarkdownFromPackage();
    if (fromPkg && fromPkg.trim()) return fromPkg;
    return `# Code style and UI (BembaJS starter)\n\nInstall a complete **bembajs-core** package (with \`docs/CODE-STYLE-AND-UI.md\`) or see [bembajs.dev/docs](https://bembajs.dev/docs).\n`;
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
 * Write scaffold files. scope `docs` updates only docs/CODE-STYLE-AND-UI.md (from package file).
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
