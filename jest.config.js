module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/__tests__/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  // Explicitly tell Jest which files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/test-config/'
  ]
};
