import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import taildwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from 'path'
import fs from 'fs-extra'
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    plugins: [
        vue(),
        vuetify(),
        {
            name: 'after-build',
            closeBundle: async () => {
                await fs.ensureDir(path.resolve(__dirname, '../extension/dist'))
                await fs.remove(
                    path.resolve(__dirname, '../extension/dist/assets')
                )

                await fs.copy(
                    path.resolve(__dirname, 'dist/assets'),
                    path.resolve(__dirname, '../extension/dist/assets')
                )
            },
        },
    ],
    css: {
        postcss: {
            plugins: [taildwindcss, autoprefixer],
        },
    },
    build: {
        minify: 'terser',
        sourcemap: false,
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
            keep_classnames: true,
        },
    },
})
