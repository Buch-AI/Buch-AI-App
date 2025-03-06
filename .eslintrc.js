// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'google', 'plugin:tailwindcss/recommended'],
  ignorePatterns: ['/dist/*'],
  rules: {
    // Disable conflicting rules from google style
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    // Enforce Google style specifics
    'indent': ['error', 2],
    'max-len': ['error', { code: 100 }],
    'semi': [2, 'always'],
    'object-curly-spacing': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'quote-props': ['error', 'consistent'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'import/order': [
      1,
      {
        'groups': [
          'external',
          'builtin',
          'internal',
          'sibling',
          'parent',
          'index',
        ],
        'pathGroups': [
          {
            'pattern': 'components',
            'group': 'internal',
          },
          {
            'pattern': 'common',
            'group': 'internal',
          },
          {
            'pattern': 'routes/ **',
            'group': 'internal',
          },
          {
            'pattern': 'assets/**',
            'group': 'internal',
            'position': 'after',
          },
        ],
        'pathGroupsExcludedImportTypes': ['internal'],
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true,
        },
      },
    ],
    'tailwindcss/classnames-order': ['error'],
  },
};
