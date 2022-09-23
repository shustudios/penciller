import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const env = dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  env: env.parsed,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
		port: process.env.SERVER_PORT,
    https: {
      key: fs.readFileSync(path.resolve(process.env.KEY_PATH, 'privkey.pem')),
      cert: fs.readFileSync(path.resolve(process.env.CERT_PATH, 'fullchain.pem'))
    }
	}
})
