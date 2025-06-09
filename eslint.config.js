import { defineConfig } from 'eslint/config';
import globals from 'globals';
import css from '@eslint/css';

export default defineConfig([
  { files: ['**/*.js'], languageOptions: { sourceType: 'script' } },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.browser },
  },
  { files: ['**/*.css'], plugins: { css }, language: 'css/css' },
]);
