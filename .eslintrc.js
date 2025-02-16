// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'google'],
  ignorePatterns: ['/dist/*'],
  rules: {
    // Disable conflicting rules from google style
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    // Enforce Google style specifics
    'indent': ['error', 2],
    'max-len': ['error', { code: 100 }],
    'object-curly-spacing': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'quote-props': ['error', 'consistent'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
  },
};
