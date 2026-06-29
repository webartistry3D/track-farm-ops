import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import react from 'eslint-plugin-react'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      react.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/no-array-index-key': 'off',
      'react/jsx-key': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-refresh/only-export-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'no-unused-vars': 'off',
      'no-console': 'off',
      'prefer-const': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-empty-pattern': 'off',
      'react/no-unescaped-entities': 'off',
      'no-useless-escape': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
])
