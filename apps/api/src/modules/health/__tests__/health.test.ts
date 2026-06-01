import request from 'supertest';

import { createApp } from '../../../app';

describe('api health', () => {
  it('returns ok', async () => {
    const response = await request(createApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
