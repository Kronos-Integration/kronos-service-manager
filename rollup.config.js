import executable from 'rollup-plugin-executable';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

export default {
  plugins: [],
  external: [
    'kronos-endpoint',
    'kronos-service',
    'model-attributes',
    'kronos-flow',
    'kronos-service'
  ],
  input: pkg.module,

  output: {
    format: 'cjs',
    file: pkg.main
  }
};
