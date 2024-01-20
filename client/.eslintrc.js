module.exports = {
    env: {
        browser: true, // Adds browser global variables
        es2021: true, // Enables ECMAScript 2021 globals and syntax
        node: true,  // Adds Node.js global variables and Node.js scoping
    },
    extends: [
        'airbnb', // Extends Airbnb style guide rules
        'plugin:react/recommended', // Use recommended rules from eslint-plugin-react
        'plugin:react-hooks/recommended', // Use recommended rules for React hooks
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true, // Allows for parsing of JSX
        },
        ecmaVersion: 12, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    plugins: [
        'react', // Enables eslint-plugin-react for React-specific linting rules
        'react-hooks' // Enables linting rules for React hooks
    ],
    rules: {
        // Custom rules can be defined here
        'react/jsx-filename-extension': [1, { 'extensions': ['.js', '.jsx'] }], // Allows JSX in .js and .jsx files
        'react/react-in-jsx-scope': 'off', // Not necessary in React 17+
        'jsx-a11y/anchor-is-valid': 'off', // Specific anchor validation rules (adjust as needed)
        'no-console': 'warn', // Warns about console.log usage
        'react/prop-types': 'off', // Turns off prop-types rule, useful if using TypeScript
    },
    settings: {
        react: {
            version: 'detect', // Automatically detect the React version
        },
    },
};
