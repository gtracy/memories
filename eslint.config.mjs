import vitest from '@vitest/eslint-plugin';

export default [
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                process: 'readonly',
                console: 'readonly',
                module: 'readonly',
                require: 'readonly',
                __dirname: 'readonly',
                exports: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly'
            }
        },
        plugins: {
            vitest
        },
        rules: {
            ...vitest.configs.recommended.rules,
            'no-unused-vars': 'warn',
            'no-console': 'off'
        }
    }
];
