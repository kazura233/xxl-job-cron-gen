import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: false,
    clean: true,
    external: ['react', 'react-dom'],
    loader: { '.css': 'copy' },
    esbuildOptions(options) {
      options.assetNames = '[name]'
    },
  },
])
