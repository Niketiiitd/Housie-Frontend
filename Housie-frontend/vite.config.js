import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Map '@' to the 'src' directory
    },
  },
  build: {
    outDir: 'dist', // Ensure this matches the expected output directory
  },
});
