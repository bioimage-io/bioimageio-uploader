module.exports = {
	root: true,
	extends: [
        'eslint:recommended', 
        'plugin:@typescript-eslint/recommended',
        'plugin:svelte/recommended', 
        'prettier'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
        parser: {
          // Specify a parser for each lang.
          ts: '@typescript-eslint/parser',
          js: 'espree',
          typescript: '@typescript-eslint/parser'
        }
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
