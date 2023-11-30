module.exports = {
  root: true,
  extends: ['universe/native', 'plugin:@tanstack/eslint-plugin-query/recommended'],
  ignorePatterns: ['metro.config.js', 'babel.config.js', 'jest.config.js', 'node_modules/'],
  rules: {
    'import/order': 'off'
  }
}
