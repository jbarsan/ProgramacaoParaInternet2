/**
 * Configuração do Vite para o projeto `produtos-web`
 *
 * Integra o plugin oficial do React e o plugin oficial do TailwindCSS v4.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
});

