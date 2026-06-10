import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTransfer } from './useServices';

const mockTransferMoney = vi.fn();
const mockTransferToFD = vi.fn();

vi.mock('../lib/services', () => ({
  ServiceLocator: {
    getTransferService: () => ({
      transferMoney: mockTransferMoney,
      transferToFD: mockTransferToFD,
    }),
  },
}));

function TransferHookTest() {
  const { transfer, transferToFD, loading, error, success } = useTransfer('user-1');

  return (
    <div>
      <button type="button" onClick={() => transfer({ fromUserId: 'user-1', toUserName: 'alice', amount: 100 })}>
        Do Transfer
      </button>
      <button type="button" onClick={() => transferToFD(250)}>
        Transfer To FD
      </button>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error}</span>
      <span data-testid="success">{success}</span>
    </div>
  );
}

describe('useTransfer', () => {
  beforeEach(() => {
    mockTransferMoney.mockReset();
    mockTransferToFD.mockReset();
  });

  it('performs transferMoney and updates success state', async () => {
    mockTransferMoney.mockResolvedValue({ success: true, message: 'Transfer OK' });

    render(<TransferHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /do transfer/i }));

    await waitFor(() => expect(mockTransferMoney).toHaveBeenCalledWith({ fromUserId: 'user-1', toUserName: 'alice', amount: 100 }));
    await waitFor(() => expect(screen.getByTestId('success')).toHaveTextContent('Transfer OK'));
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('handles transferMoney failure and sets error', async () => {
    mockTransferMoney.mockResolvedValue({ success: false, error: 'Insufficient funds' });

    render(<TransferHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /do transfer/i }));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Insufficient funds'));
    expect(screen.getByTestId('success')).toHaveTextContent('');
  });

  it('performs transferToFD and updates success state', async () => {
    mockTransferToFD.mockResolvedValue({ success: true, message: 'FD Transfer OK' });

    render(<TransferHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /transfer to fd/i }));

    await waitFor(() => expect(mockTransferToFD).toHaveBeenCalledWith('user-1', 250, undefined));
    await waitFor(() => expect(screen.getByTestId('success')).toHaveTextContent('FD Transfer OK'));
  });
});
