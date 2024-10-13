const react = require('eslint-plugin-react');
const globals = require('globals');
const js = require("@eslint/js");

module.exports = [
  // Using eslint recommends
  // https://eslint.org/docs/latest/use/configure/configuration-files#using-predefined-configurations
  js.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
      },
    },
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react,
    },
    rules: {
      "indent": ["error", 2 ],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "double" ],
      "semi": ["error", "always" ],
      "no-unused-vars": "off",
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
    }
  },
];
