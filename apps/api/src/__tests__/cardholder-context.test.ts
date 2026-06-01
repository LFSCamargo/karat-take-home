import { afterEach, describe, expect, it } from 'vitest';

import { resolveCardholderId } from '../http/cardholder-context';
import {
  clearDefaultCardholderId,
  setDefaultCardholderId,
} from '../test/cardholder-context';

describe('resolveCardholderId', () => {
  afterEach(() => {
    clearDefaultCardholderId();
  });

  it('uses cardholder id already attached to the request', () => {
    expect(
      resolveCardholderId({
        cardholderId: '11111111-1111-1111-1111-111111111111',
      }),
    ).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('falls back to DEFAULT_CARDHOLDER_ID when request has no cardholder', () => {
    setDefaultCardholderId('22222222-2222-2222-2222-222222222222');

    expect(resolveCardholderId({})).toBe(
      '22222222-2222-2222-2222-222222222222',
    );
  });

  it('returns undefined when no trusted cardholder context exists', () => {
    expect(resolveCardholderId({})).toBeUndefined();
  });
});
