import path from 'path';
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
    // const isDev = command === 'serve';

    return {
        define: {
            __VERSION__: JSON.stringify(require('./package.json').version),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        server: {
            open: './index.html',
        },
        optimizeDeps: {
            esbuildOptions: {
                loader: {
                    ".frag": "text",
                },
            },
        },
    };
});