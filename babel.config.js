module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxRuntime: 'automatic' }],
    ],
    plugins: [
      // Add any required plugins here
    ],
  };
};
