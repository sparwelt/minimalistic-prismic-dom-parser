module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    jasmine: true
  },
  parser: 'babel-eslint',
  parserOptions: {
    babelOptions: {
      configFile: 'babel.config.js'
    }
  },
  extends: ['plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'no-console': 'error',
    'no-debugger': 'off',
    'space-before-function-paren': ['off', 'always'],
    'one-var': ['error', 'never'],
    'object-curly-spacing': [
      'error',
      'always',
      { arraysInObjects: true, objectsInObjects: true }
    ]
  }
}
