import { defineConfig } from 'vite';

export default defineConfig({
  base: '/TapTapTree/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets/build',
    assetsInlineLimit: 0,
    rollupOptions: { input: 'app.html' },
  },
});
