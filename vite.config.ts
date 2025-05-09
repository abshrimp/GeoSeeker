import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['/favicon.ico', 'assets/apple-touch-icon.png'],
            injectRegister: 'auto',
            manifest: {
                name: 'GeoSeeker',
                short_name: 'GeoSeeker',
                description: 'Geography Guessing Game',
                theme_color: '#ffffff',
                start_url: '/',
                icons: [
                    {
                        src: 'assets/192_img.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'assets/512_img.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    optimizeDeps: {
        exclude: ['lucide-react'],
    }
});
