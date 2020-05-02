module.exports = {
	'env': {
		'browser': true,
		'es6': true
	},
	"settings": {
		"react": {
			"version": "detect"
		}
	},
	'extends': [
		'eslint:recommended',
		'plugin:react/recommended',
		"plugin:prettier/recommended"
	],
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaFeatures': {
			'jsx': true
		},
		'ecmaVersion': 2018,
		'sourceType': 'module'
	},
	'plugins': [
		'react'
	],
	'rules': {
		'indent': [
			'error',
			'tab',
			{ "SwitchCase": 1 }
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		]
	}
};