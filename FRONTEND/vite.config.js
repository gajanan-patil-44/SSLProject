// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//   ],
// })


import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    react(),
        tailwindcss(),

    babel({
      presets: [reactCompilerPreset()]
    })
  ],

  oxc: {
    drop: ['console', 'debugger']
  },

  server: {
    host: true,
    port: 5175
  }
})