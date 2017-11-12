
module.exports = function () {
  return {
    files: [
      {
        pattern: 'src/**/tests/fixtures/*.js',
        instrument: false
      },
      'src/**/*.js', '!src/**/tests/*.spec.js'
    ],
    tests: ['src/**/tests/*.spec.js'],
    env: {
      type: 'node',
      runner: 'node'
    }
  }
};
