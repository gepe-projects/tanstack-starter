//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'import/consistent-type-specifier-style': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    // Vendored/copied component libraries (animate-ui) — kode dari registry,
    // jangan diubah manual; longgar-kan aturan strict yang tidak relevan.
    files: ['src/components/animate-ui/**'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
  {
    ignores: ['eslint.config.js', 'prettier.config.js', '.output/**'],
  },
]
