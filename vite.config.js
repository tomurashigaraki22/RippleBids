import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { nodePolyfills } from "vite-plugin-node-polyfills"


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  preview: {
    port: 5173,
    allowedHosts: ['bridge.ripplebids.com']
  }
})
