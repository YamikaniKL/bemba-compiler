import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePluginBemba } from 'bembajs-core/vite-plugin-bemba';

export default defineConfig({
  plugins: [vitePluginBemba(), react({ include: [/\.[jt]sx$/, /\.bsx$/] })],
  css: {
    // Keep scaffold isolated from parent postcss.config.* files.
    postcss: {
      plugins: []
    }
  },
  esbuild: {
    include: /src\/.*\.(jsx|bsx|tsx|js|ts)$/,
    loader: 'jsx'
  },
  resolve: {
    extensions: ['.bemba', '.bsx', '.jsx', '.js', '.tsx', '.ts', '.json']
  },
  server: { port: 3000 },
  build: { outDir: 'dist' }
});
