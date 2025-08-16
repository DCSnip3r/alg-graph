import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Adjust this if deploying to a root domain (username.github.io) or custom domain.
// For repo-based GitHub Pages: https://<USERNAME>.github.io/<REPO>/ use base: '/<REPO>/'
// For this repository (alg-graph) under user/org DCSnip3r:
//   Production URL will be: https://dcsnip3r.github.io/alg-graph/
// If you later use a custom domain, change base to '/'.
export default defineConfig({
  base: '/alg-graph/',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Keep twisty-player (from cubing library) as a custom element so Vue doesn't warn
          isCustomElement: (tag) => tag === 'twisty-player',
        },
      },
    }),
  ],
  build: {
    sourcemap: true,
  },
});
