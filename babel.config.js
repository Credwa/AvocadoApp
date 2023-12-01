module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      'expo-router/babel',
      ['babel-plugin-react-docgen-typescript', { exclude: 'node_modules' }]
    ]
  }
}
