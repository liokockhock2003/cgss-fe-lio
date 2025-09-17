import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import eslintAutoImport from './.eslintrc-auto-import.json' with { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: ['**/dist', '**/.eslintrc.cjs'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended',
      'plugin:react/recommended',
      'plugin:prettier/recommended',
    ),
  ),
  {
    plugins: {
      'react-refresh': reactRefresh,
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...eslintAutoImport.globals,
      },

      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      'prettier/prettier': 0,
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 0,
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      "react/jsx-no-undef": ['error', { "allowGlobals": true }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    },
  },

  // {
  //   files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
  //   ...reactPlugin.configs.flat.recommended,
  //   languageOptions: {
  //     ...reactPlugin.configs.flat.recommended.languageOptions,
  //     globals: {
  //       ...globals.serviceworker,
  //       ...globals.browser,
  //     },
  //   },
  // },
]
