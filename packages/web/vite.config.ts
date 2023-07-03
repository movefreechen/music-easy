import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import taildwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from 'path'
import fs from 'fs-extra'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`
            }
        }
    },
    plugins: [
        react(),
        {
            name: 'after-build',
            closeBundle: async () => {
                await fs.remove(
                    path.resolve(__dirname, '../extension/dist/assets')
                )
                await fs.copy(
                    path.resolve(__dirname, 'dist/assets'),
                    path.resolve(__dirname, '../extension/dist/assets')
                )
            }
        }
    ],
    css: {
        postcss: {
            plugins: [taildwindcss, autoprefixer],
        },
    },
})
