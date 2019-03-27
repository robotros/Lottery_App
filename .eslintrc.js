module.exports = {
  "env": {
    "browser": true,
    "es6": true,
  },
  "extends": [
    "eslint:recommended", 
    "plugin:react/recommended", 
    "google",
    "plugin:jsx-a11y/recommended",
  ],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "modules": true,
      "experimentalObjectRestSpread": true,
    },
  },
  "plugins": ["react", "jsx-a11y",],
  "rules": {
  },
};
