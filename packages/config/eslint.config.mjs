import tseslint from 'typescript-eslint';

const restrictedImports = (forbidden) => ({
  patterns: forbidden.flatMap((pkg) => [
    {
      group: [pkg, `${pkg}/*`],
      message: `Boundary violation: this package must not import ${pkg}.`,
    },
  ]),
});

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/coverage/**',
    ],
  },
  ...tseslint.configs.recommended.map((c) => ({
    ...c,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['packages/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        restrictedImports(['@app/web', '@app/agent-api']),
      ],
    },
  },
  {
    files: ['packages/web/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        restrictedImports(['@app/agent-api']),
      ],
    },
  },
  {
    files: ['packages/agent-api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        restrictedImports(['@app/web']),
      ],
    },
  },
);
