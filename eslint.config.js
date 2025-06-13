import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

const tsConfig = ts.config({
	files: ['**/*.js', '**/*.ts', '**/*.svelte'],
	extends: [
		js.configs.recommended,
		...ts.configs.strictTypeChecked,
		...ts.configs.stylisticTypeChecked,
		prettier
	],
	languageOptions: {
		globals: {
			...globals.browser,
			...globals.nodeBuiltin
		},
		parserOptions: {
			projectService: true,
			tsconfigRootDir: import.meta.dirname,
			extraFileExtensions: ['.svelte'],
			programs: false
		}
	}
});

const svelteConfig = ts.config({
	files: ['**/*.svelte'],
	extends: [...svelte.configs['flat/recommended'], ...svelte.configs['flat/prettier']],
	languageOptions: {
		parserOptions: {
			projectService: true,
			parser: ts.parser
		}
	}
});

export default ts.config(...tsConfig, ...svelteConfig, {
	ignores: ['eslint.config.js', 'svelte.config.js', 'build', '.svelte-kit/']
});
