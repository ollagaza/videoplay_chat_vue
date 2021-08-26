// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // check if imports actually resolve
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': 'build/webpack.base.conf.js'
      }
    }
  },
  // add your custom rules here
  'rules': {
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never',
      'vue': 'never'
    }],
    "import/prefer-default-export": "off",
    "import/first": "off",
    "no-param-reassign": "off",
    "no-shadow": "off",
    "global-require": "off",
    "camelcase": "off",
    "no-mixed-operators": "off",
    "max-len": "off",
    "no-plusplus": "off",
    "no-cond-assign": "off",
    "no-return-await": "off",
    "no-underscore-dangle": "off",
    "no-alert": "off",
    "no-continue": "off",
    "no-unused-vars": "off",
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/index.js']
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    "linebreak-style": 0,
    "eslint linebreak-style": [
      0,
      "error",
      "windows"
    ]
  }
};
