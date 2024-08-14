import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: { allowJs: true } }]
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(wagmi|@wagmi)/)'],

  // TODO: Remove this when the `sdk-starter-kit` is published to npm
  // An array of regexp pattern strings that are matched against all test paths before executing the test.
  // If the test path matches any of the patterns, it will be skipped
  testPathIgnorePatterns: ['<rootDir>/safe-core-sdk/'],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@/(.*)\\.js$': '<rootDir>/src/$1',
    '^@test/(.*)\\.js$': '<rootDir>/test/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
}

export default config
