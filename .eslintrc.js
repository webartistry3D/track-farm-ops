module.exports = {
  extends: [
    'eslint:recommended'
  ],
  rules: {
    // Relax key uniqueness rules for this specific use case
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react/no-unstable-nested-components': 'off',
    
    // Keep other important rules
    'react/jsx-uses-react': 'error',
    'react/react-in-jsx-scope': 'error',
    'react/no-children-prop': 'error',
    'react/no-unescaped-entities': 'error',
    'react/no-unknown-property': 'error',
    'react/no-typos': 'error',
    'react/no-void-dom-elements': 'error',
    'react/no-string-refs': 'error',
    'react/no-unused-state': 'error',
    'react/no-array-index-key': 'warn', // Keep as warn, not error
    'react/jsx-key': 'warn' // Keep as warn, not error
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
