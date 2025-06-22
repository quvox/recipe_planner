import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pagesデプロイ用のベースパス設定
  // リポジトリ名に応じて動的に設定
  base: process.env.NODE_ENV === 'production' ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'menu-planner'}/` : '/',
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '献立提案アプリ',
        short_name: '献立アプリ',
        description: 'AI による時短料理の献立提案アプリ',
        theme_color: '#3b82f6',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: process.env.NODE_ENV === 'production' ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'menu-planner'}/` : '/',
        scope: process.env.NODE_ENV === 'production' ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'menu-planner'}/` : '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openai\.com\/.*/i,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
  
  // プロダクションビルド設定
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['zustand', 'idb']
        }
      }
    }
  }
})
