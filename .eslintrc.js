/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
module.exports = {
  parser: 'babel-eslint',
  extends: [
	  'airbnb',
  ],
  rules: {
	 'linebreak-style': 0,
	  'max-len': ['error', 90, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: false,
      ignoreTemplateLiterals: false,
	  }],
  },
};
