module.exports = {
  preset: '@react-native/jest-preset',
  // The preset's default pattern only unignores react-native itself;
  // @react-navigation ships ESM in node_modules too and needs transforming.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community|-async-storage)?|@react-navigation|@op-engineering|phosphor-react-native)/)',
  ],
  // phosphor-react-native's package.json "exports" field blocks deep
  // imports like lib/module/icons/* (app code uses these instead of the
  // ~1500-icon barrel — see src/types/phosphor-react-native.d.ts). Jest's
  // resolver enforces "exports" same as Node, so route those specifiers
  // straight to their physical files.
  moduleNameMapper: {
    '^phosphor-react-native/lib/module/lib$':
      '<rootDir>/node_modules/phosphor-react-native/lib/module/lib/index.js',
    '^phosphor-react-native/lib/module/icons/(.*)$':
      '<rootDir>/node_modules/phosphor-react-native/lib/module/icons/$1.js',
  },
};
