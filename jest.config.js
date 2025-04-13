module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue3-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/resources/js/$1'
  },
  testMatch: [
    '**/resources/js/**/*.test.js'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!vue)'
  ]
} 