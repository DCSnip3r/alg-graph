import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Duplicate of vite.config.ts kept for compatibility with tooling expecting JS.
// GitHub Pages deployment: site served at /alg-graph/
export default defineConfig({
  base: '/alg-graph/',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'twisty-player'
        }
      }
    })
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          cubing: [
            'cubing/alg',
            'cubing/puzzles',
            'cubing/twisty'
          ]
        }
      }
    }
  }
});
