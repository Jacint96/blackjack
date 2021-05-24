module.exports = {
  moduleFileExtensions: ['js', 'ts', 'json'],
  transform: {
    '\\.(ts|js)$': 'ts-jest',
  },
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  maxConcurrency: 1,
}
