import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

export default ts.config(
	{
		ignores: [
			'eslint.config.js',
			'svelte.config.js',
			'build',
			'.svelte-kit/',
			'src/lib/components/ui/',
			'src/routes/test/'
		]
	},
	{
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
				programs: false
			}
		}
	},
	{
		files: ['**/*.svelte'],
		extends: [...svelte.configs['flat/prettier'], ...svelte.configs['flat/recommended']],
		languageOptions: {
			parserOptions: {
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		},

		/* TODO: Re-enable this at some point when the type checking is improved.
		 * These rules are annoying when using not well-supported TypeScript libraries
		 * and imported SFC files are not recognised properly and needs the use of:
		 * https://github.com/ota-meshi/typescript-eslint-parser-for-extra-files
		 */
		rules: {
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off'
		}
	}
);
