# Code style and UI (BembaJS starter)

This project is set up so beginners can write **consistent JavaScript** and **cohesive UI** without guessing.

## JavaScript — [Standard JS](https://standardjs.com/)

- **No semicolons**, **2 spaces**, **single quotes**, **===** not `==`, and other rules enforced by Standard.
- Run `bun run lint` (or `npx standard`) on `.js` / `.jsx` files you add (configs, scripts, or code emitted by `bemba emit-react`).
- Auto-fix: `bun run lint:fix`

Standard intentionally avoids config files so teams do not bikeshed formatting.

## Google style guides

Use these as reference for deeper conventions and reviews:

- [JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)
- [TypeScript](https://google.github.io/styleguide/tsguide.html) if you add TS

Bemba `.bemba` files are not linted by Standard; keep **readable indentation** and **small functions** the same spirit.

## UI — shadcn-like workflow for static sites

[shadcn/ui](https://ui.shadcn.com/) is not an npm dependency you import: you **copy component source into your app** and own it. The same idea fits Bemba static pages:

1. **Design tokens** live in `amapeji/umusango.bemba` as `:root` custom properties (HSL components, like shadcn).
2. **Reusable blocks** are `pangaIcapaba` partials under `ifikopo/cipanda/`, included with `ingisa: [ 'Name' ]`.
3. **Tweak in place** — duplicate `StarterCard.bemba`, rename, and edit HTML/CSS without fighting upstream versions.

For rich **React** UI, use `bemba emit-react` and add [shadcn/ui](https://ui.shadcn.com/) in that Vite/React app (see BembaJS docs).

## Accessibility

Use real **headings**, **ARIA** attributes where needed, **visible focus** styles, and **sufficient contrast**. The starter card uses a labelled region as an example.

## Further reading

- [What is shadcn/ui?](https://shadcnstudio.com/blog/what-is-shadcn-ui-comprehensive-guide) — copy-to-own model explained
