import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/client.js',
  output: [
    {
      file: 'dist/ultralytics.js',
      format: 'umd',
      name: 'Ultralytics',
      sourcemap: true
    },
    {
      file: 'dist/ultralytics.min.js',
      format: 'umd',
      name: 'Ultralytics',
      sourcemap: true,
      plugins: [terser()]
    }
  ]
};
