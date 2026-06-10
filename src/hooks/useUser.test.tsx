import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUser } from './useServices';

const mockGetUserById = vi.fn();
const mockGetFDWithdrawInfo = vi.fn();
const mockUpdateUser = vi.fn();

vi.mock('../lib/services', () => ({
  ServiceLocator: {
    getUserService: () => ({
      getUserById: mockGetUserById,
      getFDWithdrawInfo: mockGetFDWithdrawInfo,
      updateUser: mockUpdateUser,
    }),
  },
}));

function UserHookTest() {
  const { user, fetchUser, getFDWithdrawInfo, updateUser, loading, error } = useUser('user-1');

  return (
    <div>
      <button type="button" onClick={() => fetchUser()}>
        Fetch User
      </button>
      <button type="button" onClick={() => getFDWithdrawInfo()}>
        Get FD Info
      </button>
      <button type="button" onClick={() => updateUser({ financeFeaturesEnabled: true })}>
        Update User
      </button>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error}</span>
      <span data-testid="username">{user?.name ?? ''}</span>
    </div>
  );
}

describe('useUser', () => {
  beforeEach(() => {
    mockGetUserById.mockReset();
    mockGetFDWithdrawInfo.mockReset();
    mockUpdateUser.mockReset();
  });

  it('fetches user and sets user state', async () => {
    mockGetUserById.mockResolvedValue({ success: true, data: { name: 'Alice', savingsBalance: 100, fd: 50, loanBalance: 0 } });

    render(<UserHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /fetch user/i }));

    await waitFor(() => expect(mockGetUserById).toHaveBeenCalledWith('user-1'));
    await waitFor(() => expect(screen.getByTestId('username')).toHaveTextContent('Alice'));
  });

  it('handles getFDWithdrawInfo failure gracefully', async () => {
    mockGetFDWithdrawInfo.mockResolvedValue({ success: false, error: 'No FD data' });

    render(<UserHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /get fd info/i }));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('No FD data'));
  });

  it('updates user and merges local state on success', async () => {
    mockGetUserById.mockResolvedValue({ success: true, data: { name: 'Bob', savingsBalance: 10, fd: 0, loanBalance: 0 } });
    mockUpdateUser.mockResolvedValue({ success: true, message: 'Updated' });

    render(<UserHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /fetch user/i }));
    await waitFor(() => expect(screen.getByTestId('username')).toHaveTextContent('Bob'));

    await user.click(screen.getByRole('button', { name: /update user/i }));
    await waitFor(() => expect(mockUpdateUser).toHaveBeenCalledWith('user-1', { financeFeaturesEnabled: true }));
  });
});
