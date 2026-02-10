import { nestConfig } from '@repo/jest-config';

export default {
  ...nestConfig,
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
    '^test/(.*)$': '<rootDir>/../test/$1',
  },
  collectCoverageFrom: [
    'modules/**/use-cases/**/index.(t|j)s',
    '!modules/**/use-cases/provider/**',
    '!modules/**/use-cases/errors/**',
  ],
  coverageProvider: 'babel',
};
