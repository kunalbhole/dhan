// Same rationale as __mocks__/@op-engineering/op-sqlite.ts: this is a
// native module that also drags in the `firebase` web-compat ESM package
// when required for real, which Jest can't parse either. Mock it instead
// of chasing transformIgnorePatterns deeper.
export const getAuth = jest.fn(() => ({}));
export const signInWithPhoneNumber = jest.fn(async () => ({
  verificationId: 'mock-verification-id',
  confirm: jest.fn(async () => ({})),
}));
