import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

<<<<<<< HEAD
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
=======
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
>>>>>>> fa31864e40ebe2ace03ce81dac2347aef6cb2907
})
