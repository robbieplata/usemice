import { defineConfig } from 'rolldown-vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  appType: 'spa',
  plugins: [
    react({
      plugins: [],
      tsDecorators: true,
      useAtYourOwnRisk_mutateSwcOptions(options) {
        options.jsc ??= {}
        options.jsc.transform ??= {}
        options.jsc.transform.decoratorVersion = '2023-11'
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('recharts') || id.includes('d3-')) return 'recharts'
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
            return 'react'
          }
          if (id.includes('radix-ui') || id.includes('@radix-ui')) return 'radix'
          if (id.includes('mobx')) return 'mobx'
        },
      },
    },
  },
})
