module.exports = {
  env: {
    browser: true, // Configuration to enable global variables that are present in browsers
    es2021: true, // Specifies that the codebase is using ECMAScript 2021 features
    node: true, // Enables global variables available in Node.js (e.g., process, __dirname)
  },
  extends: [
    'airbnb', // Extends the Airbnb JavaScript Style Guide, including their React best practices
    'plugin:react/recommended', // Uses the recommended linting rules from eslint-plugin-react for React specific linting
    'plugin:react-hooks/recommended', // Uses the recommended linting rules for React hooks (e.g., useEffect, useState)
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Enables linting of JSX, a syntax extension for React
    },
    ecmaVersion: 12, // Specifies the version of ECMAScript syntax to be used
    sourceType: 'module', // Allows use of ES Modules syntax (e.g., import/export)
  },
  plugins: [
    'react', // Adds eslint-plugin-react to add specific linting rules for React
    'react-hooks', // Adds eslint-plugin-react-hooks to enforce rules of hooks
  ],
  rules: {
    // Defines custom rules or overrides default rules
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }], // Allows JSX syntax in files with .js and .jsx extensions. Level 1 means warning
    'react/react-in-jsx-scope': 'off', // Disables the rule that requires React to be in scope when using JSX
    'jsx-a11y/anchor-is-valid': 'off', // Turns off the rule that enforces all anchors to be valid, customizable based on needs
    'no-console': 'warn', // Sets the rule to warn when console statements are used, helping to catch potential debugging code left in production
    'react/prop-types': 'off', // Disables the enforcement of prop types usage, which can be useful when using TypeScript for type checking instead
  },
  settings: {
    react: {
      version: 'detect', // Automatically detects the installed React version for linting purposes
    },
  },
};
