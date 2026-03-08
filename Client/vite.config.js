import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Import it

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Add it here
    
  
  ],
  server: {
    port: 5173,      // Set your preferred port here
    strictPort: true }// Forces Vite to fail if 5173 is busy, instead of switching to 5174
})

