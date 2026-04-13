/**
 * Default files for `bemba panga` / `bemba init` templates.
 */
const { BEMBA_FOLDERS } = require('./constants');

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
        <a class="bem-btn bem-btn--primary" href="https://bembajs.dev/docs" target="_blank" rel="noopener noreferrer">BembaJS docs</a>
        <a class="bem-btn bem-btn--secondary" href="/about">About this app</a>
      </div>
    </section>
  \`,
  imikalile: \`
    .bem-card__actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .bem-card--starter code {
      font-size: 0.8em;
      padding: 0.12em 0.4em;
      border-radius: 0.25rem;
      background: hsl(var(--foreground) / 0.08);
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
          ilembo: 'Deploy now',
          pakuKlikisha: 'window.open("https://vercel.com/new?utm_source=create-bembajs&utm_medium=appdir-template&utm_campaign=create-bembajs", "_blank")'
        },
        {
          ilembo: 'Read our docs',
          pakuKlikisha: 'window.open("https://bembajs.dev/docs", "_blank")'
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
          ilembo: 'Deploy now',
          pakuKlikisha: 'window.open("https://vercel.com/new?utm_source=create-bembajs&utm_medium=appdir-template&utm_campaign=create-bembajs", "_blank")'
        },
        {
          ilembo: 'Read our docs',
          pakuKlikisha: 'window.open("https://bembajs.dev/docs", "_blank")'
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

## Project structure

- \`${BEMBA_FOLDERS.PAGES}/\` — Pages (\`pangaIpepa\`), including \`umusango.bemba\` shell
- \`${BEMBA_FOLDERS.COMPONENTS}/\` — \`fyambaIcipanda\` modules and \`pangaIcapaba\` partials (\`cipanda/\` recommended)
- \`${BEMBA_FOLDERS.PUBLIC}/\` — Static assets
- \`${BEMBA_FOLDERS.API}/\` — API routes
- \`${BEMBA_FOLDERS.STYLES}/\` — Extra CSS
`;
}

function projectCodeStyleMarkdown() {
    return `# Code style and UI (BembaJS starter)

Bemba \`.bemba\` files are the source of your pages; keep **readable indentation** and **small helpers**. Optional tooling below applies only to \`.js\` / \`.jsx\` you add (scripts, emitted React, etc.).

## Linting JavaScript (optional)

This template can run **[Standard JS](https://standardjs.com/)** via \`bun run lint\` on \`.js\` / \`.jsx\` files. Auto-fix: \`bun run lint:fix\`. It is not required for Bemba pages themselves.

For team reviews, you may also use **[Google’s JS / HTML / TS guides](https://google.github.io/styleguide/)** as reference.

## UI — shadcn-like workflow for static sites

[shadcn/ui](https://ui.shadcn.com/) is not an npm dependency you import: you **copy component source into your app** and own it. The same idea fits Bemba static pages:

1. **Design tokens** live in \`amapeji/umusango.bemba\` as \`:root\` overrides for \`--bg\`, \`--surface\`, \`--text\`, \`--accent\`, and related layout variables.
2. **Reusable blocks** are \`pangaIcapaba\` partials under \`ifikopo/cipanda/\`, included with \`ingisa: [ 'Name' ]\`.
3. **Tweak in place** — duplicate \`StarterCard.bemba\`, rename, and edit HTML/CSS without fighting upstream versions.

For rich **React** UI, use \`bemba emit-react\` and add [shadcn/ui](https://ui.shadcn.com/) in that Vite/React app (see BembaJS docs).

## Accessibility

Use real **headings**, **ARIA** attributes where needed, **visible focus** styles, and **sufficient contrast**. The starter card uses a labelled region as an example.

## Further reading

- [What is shadcn/ui?](https://shadcnstudio.com/blog/what-is-shadcn-ui-comprehensive-guide) — copy-to-own model explained
`;
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
    gitignoreContent,
    editorConfigContent,
    BEMBA_FOLDERS
};
