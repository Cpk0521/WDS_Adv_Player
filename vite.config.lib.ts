import path from 'path';
import { defineConfig } from 'vite'

export default defineConfig({
    publicDir: false,
    build: {
        outDir: 'dist-lib',
        emptyOutDir: true,
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'WDSAdvPlayer',
            formats: ['es', 'umd', 'iife'],
            fileName: (format) => `wds-adv-player.${format}.js`,
        },
        rollupOptions: {
            external(id, parentId, isResolved) {
                return id.startsWith('@pixi/') || id === 'pixi.js';
            },
            output: {
                extend: true,
                globals(id: string) {
                    if (id.startsWith('@pixi/') || id === 'pixi.js') {
                        return require(`./node_modules/${id}/package.json`).namespace || 'PIXI';
                    }
                },
            },
        }
    }
})