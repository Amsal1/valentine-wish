import { defineConfig } from 'vite';

export default defineConfig({
  // Build configuration for static output
  // Requirements: 8.3 - Output static HTML, CSS, and JavaScript files for deployment
  build: {
    // Output directory for production build
    outDir: 'dist',
    // Generate source maps for debugging (disabled for production)
    sourcemap: false,
    // Minify for production using esbuild (fast and efficient)
    minify: 'esbuild',
    // Asset handling - all assets go to assets folder
    assetsDir: 'assets',
    // Ensure clean output directory on each build
    emptyOutDir: true,
    // Target modern browsers for smaller bundle size
    // Requirements: 8.5 - Work in all modern browsers
    target: 'es2020',
    // Rollup options for optimal chunking
    rollupOptions: {
      output: {
        // Ensure consistent file naming for caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  // Development server configuration
  server: {
    port: 3000,
    open: true,
  },
  // Preview server configuration (for testing production build)
  preview: {
    port: 4173,
  },
  // Base path for GitHub Pages, Vercel, Render, or similar static hosting
  // Requirements: 8.4 - Load correctly when served from GitHub Pages, Vercel, or Render
  // Using './' for relative paths ensures compatibility with subdirectory deployments
  base: './',
});
