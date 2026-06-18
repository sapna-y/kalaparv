import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        event: resolve(__dirname, 'event.html'),
        register: resolve(__dirname, 'register.html'),
        academy: resolve(__dirname, 'academy.html'),
        contact: resolve(__dirname, 'contact.html'),
        gallery: resolve(__dirname, 'gallery.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
