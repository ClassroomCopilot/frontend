module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended', // Base ESLint rules
    'plugin:react/recommended', // React-specific rules
    'plugin:react-hooks/recommended', // React hooks-specific rules
    'plugin:@typescript-eslint/recommended', // TypeScript-specific rules
    'airbnb', // Airbnb's ESLint config
    'airbnb-typescript', // Airbnb's TypeScript rules
    'airbnb/hooks', // Airbnb's React hooks rules
    'plugin:prettier/recommended', // Prettier rules
    'plugin:storybook/recommended' // Storybook rules
  ],
  ignorePatterns: [
    'dist',
    '.eslintrc.cjs'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-refresh',
    'prettier'
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error', // Ensures hooks are used correctly
    'react-hooks/exhaustive-deps': 'warn', // Ensures effect dependencies are specified correctly
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/react-in-jsx-scope': 'off',
  },
}
