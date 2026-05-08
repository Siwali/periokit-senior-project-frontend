import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true,
    }),
    Components({
      resolvers: [
        // Custom resolver for Lucide icons using 'l-' prefix
        (name) => {
          if (name.startsWith('L')) {
            return { name: name.slice(1), from: 'lucide-vue-next' }
          }
        },
      ],
      dts: true,
    }),
  ],
})
