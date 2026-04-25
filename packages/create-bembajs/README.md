# create-bembajs

Scaffold a new BembaJS app.

## Usage

```bash
bunx create-bembajs my-app
cd my-app
bun install
bun run dev
```

## Templates

- `base` - React-first starter
- `ui` - base plus starter UI blocks

## Output

Generated projects include:

- app/page structure under `amapeji/`
- `bemba` CLI scripts (`dev`, `build`, `start`, `export`)
- `vite.config.mjs` with Bemba Vite plugin wiring
