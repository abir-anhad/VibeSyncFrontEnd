import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: true,
    host: true, // or '0.0.0.0' to expose
  },
  plugins: [react(), mkcert()],
})
