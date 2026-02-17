
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Terminal warning for missing keys to help developer debugging
  if (!env.API_KEY) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  WARNING: API_KEY is missing in .env file. The app will not function correctly.');
  }

  return {
    plugins: [react()],
    define: {
      // Definiramo process.env objekt kako bismo izbjegli "process is not defined" grešku
      // koja se javlja kada biblioteke (ili naš kod) pokušavaju pristupiti process.env.
      // Osiguravamo da su vrijednosti barem prazni stringovi ako ne postoje, da izbjegnemo "undefined" u kodu.
      'process.env': {
        API_KEY: JSON.stringify(env.API_KEY || ''),
        RESEND_API_KEY: JSON.stringify(env.RESEND_API_KEY || ''),
        NODE_ENV: JSON.stringify(mode)
      }
    }
  }
})
