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
            // Allow class declarations for legacy compatibility only
            'max-lines': 'off',
            'max-lines-per-function': 'off',
        },
    },
];
