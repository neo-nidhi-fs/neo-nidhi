import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminTransactionsPage from './page';

describe('AdminTransactionsPage', () => {
  let originalFetch: typeof global.fetch | undefined;
  let requestedUrls: string[];
  let postedBody: Record<string, unknown> | undefined;

  beforeEach(() => {
    originalFetch = global.fetch;
    requestedUrls = [];
    postedBody = undefined;

    vi.stubGlobal('fetch', (input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.url;
      requestedUrls.push(url);

      if (url.endsWith('/api/transactions') && init?.method === 'POST') {
        postedBody = JSON.parse(String(init.body));
        return Promise.resolve(
          new Response(JSON.stringify({ success: true }), { status: 201 })
        );
      }

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
    expect(requestedUrls).toContain('/api/transactions?page=1&limit=15');
  });

  it('submits optional transaction notes', async () => {
    const user = userEvent.setup();
    render(<AdminTransactionsPage />);
    await waitFor(() =>
      expect(screen.getByText(/Total Transaction Volume/i)).toBeTruthy()
    );

    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));
    await user.selectOptions(screen.getByLabelText('User'), 'u1');
    await user.selectOptions(screen.getByLabelText('Type'), 'deposit');
    await user.type(screen.getByLabelText('Amount'), '100');
    await user.type(
      screen.getByLabelText('Notes (optional)'),
      'Monthly savings'
    );
    const addButtons = screen.getAllByRole('button', {
      name: 'Add Transaction',
    });
    await user.click(addButtons[addButtons.length - 1]);

    await waitFor(() =>
      expect(postedBody).toEqual({
        userId: 'u1',
        type: 'deposit',
        amount: 100,
        notes: 'Monthly savings',
      })
    );
  });
});
