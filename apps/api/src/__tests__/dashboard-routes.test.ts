import request from 'supertest';

import { createApp } from '../app';

describe('dashboard routes', () => {
  it('returns typed dashboard metrics', async () => {
    const response = await request(createApp()).get('/api/metrics');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalSpend: 0,
      transactionCount: 0,
      averageTransactionAmount: 0,
      latestActivityAt: null,
      currency: 'usd',
    });
  });

  it('validates transaction query params', async () => {
    const response = await request(createApp()).get(
      '/api/transactions?page=invalid',
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid request payload' });
  });
});
