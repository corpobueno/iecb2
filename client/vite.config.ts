// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Sysnode',
        short_name: 'Sysnode',
        description: 'Sistema de Gerenciamento de Rotas de Entrega',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB para permitir chunks grandes como MUI
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separar bibliotecas grandes
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-core': ['@mui/material'],
          'mui-icons': ['@mui/icons-material'],
          'mui-pickers': ['@mui/x-date-pickers', '@mui/lab', '@date-io/dayjs', 'dayjs'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux', 'redux-persist'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'yup'],
          'pdf-vendor': ['jspdf', 'jspdf-autotable', 'pdfmake'],
          'chart-vendor': ['recharts'],
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'utils': ['axios', 'date-fns', 'immer', 'copy-to-clipboard'],
        },
        // Otimizar nome dos chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      }
    },
    // Aumentar o limite de warning para 1000kb (já que estamos fazendo code splitting)
    chunkSizeWarningLimit: 1000,
    // Minificação otimizada
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      }
    },
    // Sourcemaps apenas para produção se necessário
    sourcemap: false,
    // Otimizar CSS
    cssCodeSplit: true,
  },
  server: {
    headers: {
      // Temporário: permite qualquer origem (não usar em produção!)
      // 'X-Frame-Options': 'ALLOW-FROM http://localhost:3000',
      'Content-Security-Policy': "frame-ancestors *"
    },
    port: 3000,
  }
});
