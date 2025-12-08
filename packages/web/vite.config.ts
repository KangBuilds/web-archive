import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import generouted from '@generouted/react-router/plugin'

export default defineConfig({
  plugins: [react(), generouted()],
  resolve: {
    alias: {
      '~': '/src',
    },
  },
  server: {
    port: 7749,
    proxy: {
      '/api': {
        target: 'http://localhost:9981',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      input: './src/index.tsx',
      output: {
        entryFileNames: 'index.js',
        assetFileNames: 'index.css',
        chunkFileNames: 'assets/[name]-[hash].js',
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
          ],
          'tanstack-query': ['@tanstack/react-query'],
        },
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    outDir: '../../dist/service/src/static',
  },
})
