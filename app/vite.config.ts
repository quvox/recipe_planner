import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'fs'

// PWA対応のVite設定
// GitHub Pagesでのホスティングを考慮した設定
export default defineConfig({
  // 環境変数の設定
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(
      JSON.parse(readFileSync('./package.json', 'utf8')).version
    ),
    'import.meta.env.VITE_APP_AUTHOR': JSON.stringify(
      JSON.parse(readFileSync('./package.json', 'utf8')).author
    ),
    'import.meta.env.VITE_BUILD_DATE': JSON.stringify(
      new Date().toISOString().split('T')[0]
    )
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: '献立提案アプリ',
        short_name: '献立提案',
        description: 'AI が時短料理の献立案を提案するPWAアプリ',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
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
          }
        ]
      }
    })
  ],
  // GitHub Pagesでのホスティング用base設定（必要に応じて変更）
  base: './'
})
