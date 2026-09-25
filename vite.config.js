import { defineConfig } from 'vite';

export default defineConfig({
  base: '/TapTapTree/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets/build',
    rollupOptions: { input: 'app.html' },
  },
});
