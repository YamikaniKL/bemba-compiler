# bembajs

Framework runtime and CLI for BembaJS.

## Install

```bash
bun add bembajs
```

## CLI

```bash
bunx bemba panga my-app
bunx bemba tungulula
bunx bemba akha
bunx bemba fumya
```

## What it provides

- React-first dev and build flow
- Bemba syntax routing/components support
- SSR/dev server integration
- TypeScript-aware package exports (`dist/index.d.ts`)

## Notes

`bembajs` uses `bembajs-core` for compiler/runtime internals. If you build tooling, prefer importing from `bembajs-core` directly.
