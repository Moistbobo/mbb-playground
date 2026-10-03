/// <reference types="jest" />

import {
  MAX_LIST_MEMO_LENGTH,
  validateListMemo,
} from '@/features/lists/lib/list-memo-validation';

describe('validateListMemo', () => {
  it('accepts an empty memo', () => {
    expect(validateListMemo('')).toEqual({ valid: true });
  });

  it('accepts a whitespace-only memo', () => {
    expect(validateListMemo('   ')).toEqual({ valid: true });
  });

  it('accepts a memo at the limit', () => {
    expect(validateListMemo('x'.repeat(MAX_LIST_MEMO_LENGTH))).toEqual({ valid: true });
  });

  it('rejects a memo over the limit', () => {
    expect(validateListMemo('x'.repeat(MAX_LIST_MEMO_LENGTH + 1))).toEqual({
      valid: false,
      reason: 'tooLong',
    });
  });
});
