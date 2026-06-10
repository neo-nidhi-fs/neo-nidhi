import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMPIN } from './useServices';

const mockSetMPIN = vi.fn();

vi.mock('../lib/services', () => ({
  ServiceLocator: {
    getMPINService: () => ({
      setMPIN: mockSetMPIN,
    }),
  },
}));

function MPINHookTest() {
  const { setMPIN, loading, error, success } = useMPIN('user-1');
  return (
    <div>
      <button type="button" onClick={() => setMPIN('1234', '0000')}>
        Update MPIN
      </button>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error}</span>
      <span data-testid="success">{success}</span>
    </div>
  );
}

describe('useMPIN', () => {
  beforeEach(() => {
    mockSetMPIN.mockReset();
  });

  it('sets MPIN successfully and updates success state', async () => {
    mockSetMPIN.mockResolvedValue({
      success: true,
      message: 'MPIN updated successfully',
    });

    render(<MPINHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /update mpin/i }));

    await waitFor(() => expect(mockSetMPIN).toHaveBeenCalledWith('user-1', {
      newMPin: '1234',
      oldMPin: '0000',
    }));

    await waitFor(() => expect(screen.getByTestId('success')).toHaveTextContent('MPIN updated successfully'));
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('handles MPIN update failure and sets error state', async () => {
    mockSetMPIN.mockResolvedValue({
      success: false,
      error: 'Invalid MPIN',
    });

    render(<MPINHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /update mpin/i }));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Invalid MPIN'));
    expect(screen.getByTestId('success')).toHaveTextContent('');
  });
});
