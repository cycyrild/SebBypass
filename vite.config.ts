import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'bg.html'),
        popup: resolve(__dirname, 'popup.html'),
        debugging: resolve(__dirname, 'debugging.html')
      },
      output: {
        dir: 'dist',
        format: 'esm',
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    },
    outDir: 'dist',
    sourcemap: false
  }
});
