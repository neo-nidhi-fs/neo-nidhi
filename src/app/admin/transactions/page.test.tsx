import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminTransactionsPage from './page';

describe('AdminTransactionsPage', () => {
  let originalFetch: typeof global.fetch | undefined;

  beforeEach(() => {
    originalFetch = global.fetch;

    vi.stubGlobal('fetch', (input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;

      if (url.endsWith('/api/users')) {
        return Promise.resolve(new Response(JSON.stringify({ data: [{ _id: 'u1', name: 'Alice', age: 30, savingsBalance: 0, loanBalance: 0 }] }), { status: 200 }));
      }

      if (url.includes('/api/transactions')) {
        return Promise.resolve(new Response(JSON.stringify({ data: [{ _id: 't1', userId: 'u1', type: 'deposit', amount: 100, date: new Date().toISOString() }], total: 1, totalAmount: 100 }), { status: 200 }));
      }

      return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }));
    });
  });

  afterEach(() => {
    if (originalFetch) global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders totals and transaction rows from paginated API', async () => {
    render(<AdminTransactionsPage />);
    await waitFor(() => expect(screen.getByText(/Total Transaction Volume/i)).toBeTruthy());

    // Check totals text and a transaction row user
    await waitFor(() => expect(screen.getByText(/Across 1 transactions/i)).toBeTruthy());
    await waitFor(() => expect(screen.getByText(/Alice/)).toBeTruthy());
  });
});
