import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: './src/index.js',
  output: {
    format: 'umd',
    name: 'Vue',
    file: 'dist/vue.js',
    sourcemap: true
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    resolve()
  ]
}