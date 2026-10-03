module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.frontend.json', './tsconfig.backend.json', './frontend/tsconfig.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 'latest',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'boundaries'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/strict-type-checked',
  ],
  ignorePatterns: ['node_modules/', 'dist/', 'dist-backend/', '.next/', 'coverage/'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@supabase/supabase-js'],
            message: 'Direct Supabase client imports are forbidden outside server and app/api.',
          },
        ],
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: "ImportDeclaration[source.value=/\\.(?:js|jsx|mjs|cjs)$/]",
        message: 'JavaScript files are not allowed in application code.',
      },
    ],
  },
  overrides: [
    {
      files: ['app/**', 'components/**', 'hooks/**', 'lib/**', 'src/**'],
      rules: {
        'boundaries/element-types': ['error', {
          default: 'disallow',
          rules: [
            { from: ['app'], allow: ['components', 'hooks', 'lib', 'shared'] },
            { from: ['components', 'hooks', 'lib'], allow: ['shared'] },
            { from: ['shared'], allow: [] },
          ],
        }],
      },
    },
    {
      files: ['server/**', 'app/api/**'],
      rules: {
        'boundaries/element-types': ['error', {
          default: 'disallow',
          rules: [
            { from: ['server'], allow: ['shared'] },
            { from: ['app/api'], allow: ['shared'] },
            { from: ['shared'], allow: [] },
          ],
        }],
      },
    },
  ],
};
