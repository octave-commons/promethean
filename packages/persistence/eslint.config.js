import baseConfig from '../../eslint.config.ts';

export default [
    ...baseConfig,
    {
        files: ['src/**/*.ts'],
        rules: {
            // Allow class declarations for legacy compatibility
            'no-restricted-syntax': [
                'error',
                {
                    selector: "CallExpression[callee.name='require']",
                    message: 'ESM only',
                },
                {
                    selector: "MemberExpression[object.name='module'][property.name='exports']",
                    message: 'ESM only',
                },
                // Remove ClassDeclaration and ClassExpression restrictions
            ],
            // Relax some functional rules for legacy code
            'functional/no-try-statements': 'off',
            'functional/no-loop-statements': 'off',
            'functional/immutable-data': 'off',
            'functional/prefer-immutable-types': 'off',
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            'max-lines': 'off',
            'max-lines-per-function': 'off',
        },
    },
];
