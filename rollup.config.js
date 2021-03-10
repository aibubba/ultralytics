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
