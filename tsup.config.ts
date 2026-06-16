import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['cjs'],
    dts: true,
    sourcemap: false,
    clean: true,
    external: ['react', 'react-dom'],
    loader: { '.css': 'copy' },
    esbuildOptions(options) {
      options.assetNames = '[name]'
    },
  },
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm'],
    dts: false, // cjs已经输出dts了
    sourcemap: false,
    clean: false, // cjs已经clean了
    external: ['react', 'react-dom'],
    loader: { '.css': 'copy' },
    esbuildOptions(options) {
      options.assetNames = '[name]'
    },
  },
])
