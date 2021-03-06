module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: [
    'eslint:recommended',
  ],
  rules: {
    'comma-dangle': 0,
    'curly': 'warn',
    'global-require': 0,
    'max-len': [
      2, 500, 2, {
        ignoreUrls: true,
        ignoreComments: false,
      },
    ],
    'no-console': ['off', { allow: ['warn', 'error'] }],
    'no-implicit-coercion': [
      'error', {
        boolean: false,
        number: true,
        string: true,
      },
    ],
    'no-multi-spaces': [2, { ignoreEOLComments: true }],
    'no-trailing-spaces': 'warn',
    'no-unneeded-ternary': 'error',
    'no-whitespace-before-property': 'error',
    'object-curly-spacing': [1, 'always'],
    'quote-props': [1, 'as-needed'],
    'quotes': [2, 'single', { allowTemplateLiterals: true }],
    'switch-colon-spacing': [2, { after: true, before: false }],
    'indent': [
      1, 2, {
        SwitchCase: 1,
        MemberExpression: 1,
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        ignoredNodes: ['ConditionalExpression'],
      },
    ],
    'key-spacing': [1, { afterColon: true }],
    'keyword-spacing': [
      1, {
        overrides: {
          if: { before: true, after: true },
          else: { before: true, after: true },
          for: { after: true },
          super: { after: false },
          switch: { after: true },
          while: { after: true },
        },
      },
    ],
    'strict': [2, 'never'],
  },
};
