import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
        drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    build: {
        // Production optimizations
        minify: 'esbuild',
        sourcemap: false,
        // Chunk splitting for better caching
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Vendor chunk splitting based on actual imports
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                            return 'vendor-react';
                        }
                        if (id.includes('@radix-ui')) {
                            return 'vendor-radix';
                        }
                        if (id.includes('@inertiajs')) {
                            return 'vendor-inertia';
                        }
                        if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
                            return 'vendor-utils';
                        }
                    }
                },
                // Asset file naming for cache busting
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
            },
        },
        // Target modern browsers
        target: 'es2020',
        // Chunk size warning limit
        chunkSizeWarningLimit: 500,
    },
    // Optimize dependencies
    optimizeDeps: {
        include: ['react', 'react-dom', '@inertiajs/react'],
    },
}));
