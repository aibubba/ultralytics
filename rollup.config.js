import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/client.ts',
  output: [
    {
      file: 'dist/ultralytics.js',
      format: 'umd',
      name: 'Ultralytics',
      sourcemap: true,
      exports: 'named',
      globals: {}
    },
    {
      file: 'dist/ultralytics.min.js',
      format: 'umd',
      name: 'Ultralytics',
      sourcemap: true,
      exports: 'named',
      globals: {},
      plugins: [terser()]
    },
    {
      file: 'dist/ultralytics.esm.js',
      format: 'es',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/ultralytics.esm.min.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
      plugins: [terser()]
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationDir: undefined
    })
  ]
};
