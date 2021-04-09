module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'plugin:react/recommended',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'no-unused-vars': 'off',
    semi: 'off',
    quotes: 'off',
    indent: 'off',
    'react/jsx-indent': 'off',
    'react/jsx-indent-props': 'off',
    'linebreak-style': ['error', 'unix'],
    'prettier/prettier': 'off',
    'react/prop-types': ['off'],
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js'],
      },
    ],

    // this rule is awful, incourage partial if!!
    'no-else-return': ['off'],

    /**
     * camelcase is disabled because all the server identifiers
     * are in snack_case
     */
    camelcase: 'off',

    // It's safe to disable hoisted functions
    'no-use-before-define': ['error', { functions: false }],

    // props spreading is used everywere to pass huge bulk
    // of props to a component, so this lint is disabled
    'react/jsx-props-no-spreading': ['off'],

    // disabled because really slow down linting
    'import/no-cycle': ['off'],

    // default value: ['any', 'array', 'object']
    // `array` and `object` types are extensively used, a more
    // specific type would require a lot of work, the amount of work
    // that would require to type every model we have, instead
    // we coult start to use TypeStript with less burden and
    // more advantages...
    'react/forbid-prop-types': ['error', { forbid: ['any'] }],
  },
}
