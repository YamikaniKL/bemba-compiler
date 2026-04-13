/**
 * Default files for `bemba panga` / `bemba init` (base template).
 * UI tokens follow a shadcn-like semantic palette; JS tooling points at Standard + Google guides.
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
  ilyashiPaMusule: 'Starter template — see docs/CODE-STYLE-AND-UI.md',
  imikalile: \`
    :root {
      --background: 0 0% 100%;
      --foreground: 240 10% 3.9%;
      --card: 0 0% 100%;
      --card-foreground: 240 10% 3.9%;
      --muted-foreground: 240 3.8% 46.1%;
      --primary: 262 83% 58%;
      --primary-foreground: 0 0% 98%;
      --border: 240 5.9% 90%;
      --radius: 0.5rem;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --background: 240 10% 3.9%;
        --foreground: 0 0% 98%;
        --card: 240 10% 6%;
        --card-foreground: 0 0% 98%;
        --muted-foreground: 240 5% 64.9%;
        --border: 240 3.7% 15.9%;
      }
    }
    .bem-card {
      border-radius: var(--radius);
      border: 1px solid hsl(var(--border));
      background: hsl(var(--card));
      color: hsl(var(--card-foreground));
      padding: 1.5rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      max-width: 28rem;
    }
    .bem-card__title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.5rem;
      letter-spacing: -0.02em;
    }
    .bem-card__desc {
      font-size: 0.875rem;
      color: hsl(var(--muted-foreground));
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
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }
    .bem-btn--primary:hover {
      filter: brightness(1.06);
    }
    .bem-btn--secondary {
      background: transparent;
      color: hsl(var(--foreground));
      border-color: hsl(var(--border));
    }
    .bem-btn--secondary:hover {
      background: hsl(var(--foreground) / 0.06);
    }
  \`
});
`;
}

function starterCardPartial() {
    return `pangaIcapaba({
  ibeensi: \`
    <section class="bem-card bem-card--starter" role="region" aria-labelledby="starter-card-h">
      <h2 id="starter-card-h" class="bem-card__title">Starter UI block</h2>
      <p class="bem-card__desc">
        This lives in <code>ifikopo/cipanda/StarterCard.bemba</code>. Like
        <a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer">shadcn/ui</a>,
        you copy and edit the source in your repo instead of fighting a black-box package.
      </p>
      <div class="bem-card__actions">
        <a class="bem-btn bem-btn--primary" href="https://standardjs.com/" target="_blank" rel="noopener noreferrer">Standard JS</a>
        <a class="bem-btn bem-btn--secondary" href="https://google.github.io/styleguide/" target="_blank" rel="noopener noreferrer">Google guides</a>
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
  ingisa: [ 'StarterCard' ],
  umutwe: 'Create BembaJS App',
  ilyashi: 'Semantic tokens, a starter card partial, and Standard JS for any JavaScript you add.',
  ifiputulwa: [
    {
      umutwe: 'Get started',
      ilyashi: 'Install dependencies, run the dev server, and run the linter on .js files.',
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
    /* Page-specific tweaks; shared chrome + .bem-* utilities come from umusango.bemba */
  \`
});
`;
}

function aboutPage() {
    return `pangaIpepa('About', {
  umusangoSite: ee,
  umutwe: 'About',
  ilyashi: 'This page uses the same shell and design tokens as the home page.',
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

A [BembaJS](https://bembajs.dev) application with a **shared shell**, **starter partial**, and **linting** defaults.

## Getting started

\`\`\`bash
bun install
bun run dev
\`\`\`

(\`npm install\` / \`npm run dev\` work too if you use npm.)

## Code style and UI patterns

See **\`docs/CODE-STYLE-AND-UI.md\`** for:

- [JavaScript Standard Style](https://standardjs.com/) (\`bun run lint\`)
- [Google style guides](https://google.github.io/styleguide/) (JavaScript, HTML/CSS, TypeScript)
- A **shadcn-style workflow** for static sites: copy/edit partials under \`ifikopo/cipanda/\`, semantic \`--tokens\` in \`umusango.bemba\`

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

This project is set up so beginners can write **consistent JavaScript** and **cohesive UI** without guessing.

## JavaScript — [Standard JS](https://standardjs.com/)

- **No semicolons**, **2 spaces**, **single quotes**, **===** not \`==\`, and other rules enforced by Standard.
- Run \`bun run lint\` (or \`npx standard\`) on \`.js\` / \`.jsx\` files you add (configs, scripts, or code emitted by \`bemba emit-react\`).
- Auto-fix: \`bun run lint:fix\`

Standard intentionally avoids config files so teams do not bikeshed formatting.

## Google style guides

Use these as reference for deeper conventions and reviews:

- [JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)
- [TypeScript](https://google.github.io/styleguide/tsguide.html) if you add TS

Bemba \`.bemba\` files are not linted by Standard; keep **readable indentation** and **small functions** the same spirit.

## UI — shadcn-like workflow for static sites

[shadcn/ui](https://ui.shadcn.com/) is not an npm dependency you import: you **copy component source into your app** and own it. The same idea fits Bemba static pages:

1. **Design tokens** live in \`amapeji/umusango.bemba\` as \`:root\` custom properties (HSL components, like shadcn).
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
    aboutPage,
    buttonComponentBemba,
    globalCss,
    projectReadme,
    projectCodeStyleMarkdown,
    gitignoreContent,
    editorConfigContent,
    BEMBA_FOLDERS
};
