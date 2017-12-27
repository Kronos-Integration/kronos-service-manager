import multiEntry from 'rollup-plugin-multi-entry';

export default {
  input: 'tests/**/*-test.js',
  output: {
    file: 'build/bundle-test.js',
    format: 'cjs',
    sourcemap: true
  },
  external: [
    'ava',
    'kronos-endpoint',
    'kronos-service',
    'model-attributes',
    'kronos-flow',
    'kronos-service'
  ],
  plugins: [multiEntry()]
};
