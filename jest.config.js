module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./tests/env.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 30000,
  maxWorkers: 1,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/**',
    '!src/config/sequelize.config.js',
  ],
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/tests/**/*.test.js'],
};
