import baseConfig from '../../eslint.config.ts';

const dsOverrides = {
    files: ['**/*.ts'],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        'functional/no-let': 'off',
        'functional/immutable-data': 'off',
        'functional/no-loop-statements': 'off',
        'functional/prefer-immutable-types': 'off',
        'functional/no-try-statements': 'off',
        'sonarjs/cognitive-complexity': 'off',
        'sonarjs/no-collapsible-if': 'off',
        complexity: 'off',
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'max-params': 'off',
        'prefer-const': 'off',
    },
};

export default [...baseConfig, dsOverrides];
