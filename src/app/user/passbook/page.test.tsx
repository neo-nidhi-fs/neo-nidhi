import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PassbookPage from './page';

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1', role: 'user' } } }),
}));

describe('PassbookPage', () => {
  let originalFetch: typeof global.fetch | undefined;
  let requestedUrls: string[];

  beforeEach(() => {
    originalFetch = global.fetch;
    requestedUrls = [];

    vi.stubGlobal('fetch', (input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;
      requestedUrls.push(url);

      if (url.includes('/api/users/user-1/transactions')) {
        return Promise.resolve(new Response(JSON.stringify({ data: [{ _id: 'p1', type: 'deposit', amount: 100, date: new Date().toISOString() }], total: 1 }), { status: 200 }));
      }

      return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }));
    });
  });

  afterEach(() => {
    if (originalFetch) global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders passbook totals and transaction rows', async () => {
    render(<PassbookPage />);
    await waitFor(() => expect(screen.getByText(/Transaction Passbook/i)).toBeTruthy());

    await waitFor(() => expect(screen.getAllByText(/₹100.00/)).toHaveLength(2));
    // Ensure a transaction row rendered (check for type text)
    await waitFor(() => expect(screen.getAllByText(/deposit/i)).toHaveLength(2));
    expect(requestedUrls).toContain(
      '/api/users/user-1/transactions?page=1&limit=15'
    );
  });
});
