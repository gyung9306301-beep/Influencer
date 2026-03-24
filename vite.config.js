import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ranking: resolve(__dirname, 'ranking.html'),
        about: resolve(__dirname, 'about.html'),
        blog: resolve(__dirname, 'blog.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        quote: resolve(__dirname, 'quote.html'),
        landing: resolve(__dirname, 'landing.html'),
      },
    },
  },
});
