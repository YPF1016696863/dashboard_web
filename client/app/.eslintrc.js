module.exports = {
  extends: ['plugin:jest/recommended', 'prettier'],
  plugins: ['jest'],
  env: {
    'jest/globals': true
  }
};
