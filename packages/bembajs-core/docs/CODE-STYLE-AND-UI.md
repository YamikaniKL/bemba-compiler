# Code style and UI (BembaJS starter)

Bemba `.bemba` files are the source of your pages; keep **readable indentation** and **small helpers**. Optional tooling below applies only to `.js` / `.jsx` you add (scripts, emitted React, etc.).

## Linting JavaScript (optional)

This template can run **[Standard JS](https://standardjs.com/)** via `bun run lint` on `.js` / `.jsx` files. Auto-fix: `bun run lint:fix`. It is not required for Bemba pages themselves.

For team reviews, you may also use **[Google’s JS / HTML / TS guides](https://google.github.io/styleguide/)** as reference.

## UI — shadcn-like workflow for static sites

[shadcn/ui](https://ui.shadcn.com/) is not an npm dependency you import: you **copy component source into your app** and own it. The same idea fits Bemba static pages:

1. **Design tokens** live in `amapeji/umusango.bemba` as `:root` overrides for `--bg`, `--surface`, `--text`, `--accent`, etc. (same names the layout uses).
2. **Reusable blocks** are `pangaIcapaba` partials under `ifikopo/cipanda/`, included with `ingisa: [ 'Name' ]`.
3. **Tweak in place** — duplicate `StarterCard.bemba`, rename, and edit HTML/CSS without fighting upstream versions.

For rich **React** UI, use `bemba emit-react` and add [shadcn/ui](https://ui.shadcn.com/) in that Vite/React app (see BembaJS docs).

## Accessibility

Use real **headings**, **ARIA** attributes where needed, **visible focus** styles, and **sufficient contrast**. The starter card uses a labelled region as an example.

## Further reading

- [What is shadcn/ui?](https://shadcnstudio.com/blog/what-is-shadcn-ui-comprehensive-guide) — copy-to-own model explained
