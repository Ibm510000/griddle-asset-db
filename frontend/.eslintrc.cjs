module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit/eslint-config-ts/recommended',
    "plugin:@react-three/recommended",
    'prettier',
  ],

  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    "react/no-unknown-property": "off"
  },
};
