import pkg from './package.json';

export default {
  plugins: [],
  external: ['kronos-endpoint', 'kronos-service', 'model-attributes', 'registry-mixin'],
  input: pkg.module,

  output: {
    format: 'cjs',
    file: pkg.main
  }
};
