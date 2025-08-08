import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // Default Vite port
  },
  define: {
    // Expose environment variables to the client-side
    'process.env': {
      VITE_API_BASE_URL: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:5000'),
    },
  },
})
