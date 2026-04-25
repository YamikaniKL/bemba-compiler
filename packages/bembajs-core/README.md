# bembajs-core

Core compiler and transform pipeline for BembaJS.

## Install

```bash
bun add bembajs-core
```

## Core APIs

- `compile(code, options)`
- `parse(code)`
- `transform(ast)`
- `generate(ast)`
- `listStaticPageDependencyPaths(code, options)`
- `vitePluginBemba()`

## Syntax support

- Bemba keyword aliases (`leta`, `kufuma`, `fumya ca_pamushili`)
- Component/page syntax (`fyambaIcipanda`, `pangaIpepa`)
- Static import graph resolution for `.bemba` files
- React-compatible event prop mapping for generated JSX

## Test

```bash
bun run build
bun run test
```
