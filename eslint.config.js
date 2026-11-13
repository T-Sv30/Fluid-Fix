import js from '@eslint/js';
import globals from 'globals';

export default [
    { ignores: ['node_modules/', 'dist/', 'android/'] },
    js.configs.recommended,
    {
        // The app itself: classic scripts that share the page's global scope
        files: ['script.js', 'ui.js', 'native.js'],
        languageOptions: { sourceType: 'script', globals: globals.browser },
        rules: {
            'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
        },
    },
    {
        files: ['sw.js'],
        languageOptions: { sourceType: 'script', globals: globals.serviceworker },
    },
    {
        files: ['scripts/**', 'tests/**', 'eslint.config.js'],
        languageOptions: { sourceType: 'module', globals: globals.node },
        rules: {
            'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
        },
    },
];
