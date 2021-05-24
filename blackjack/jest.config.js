module.exports = {
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  "transform": {
    "\\.js$": "<rootDir>/node_modules/babel-jest"
  },
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  maxConcurrency: 1,
}