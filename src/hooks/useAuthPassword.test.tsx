import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthPassword } from './useServices';

const mockChangePassword = vi.fn();

vi.mock('../lib/services', () => ({
  ServiceLocator: {
    getAuthService: () => ({
      changePassword: mockChangePassword,
    }),
  },
}));

function AuthPasswordHookTest() {
  const { changePassword, loading, error, success } = useAuthPassword('user-1');

  return (
    <div>
      <button type="button" onClick={() => changePassword('oldpass', 'newpass')}>
        Change Password
      </button>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error}</span>
      <span data-testid="success">{success}</span>
    </div>
  );
}

describe('useAuthPassword', () => {
  beforeEach(() => {
    mockChangePassword.mockReset();
  });

  it('updates password and shows success', async () => {
    mockChangePassword.mockResolvedValue({ success: true, message: 'Password updated successfully' });

    render(<AuthPasswordHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => expect(mockChangePassword).toHaveBeenCalledWith('user-1', 'oldpass', 'newpass'));
    await waitFor(() => expect(screen.getByTestId('success')).toHaveTextContent('Password updated successfully'));
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('handles password update failure and sets error', async () => {
    mockChangePassword.mockResolvedValue({ success: false, error: 'Invalid credentials' });

    render(<AuthPasswordHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials'));
    expect(screen.getByTestId('success')).toHaveTextContent('');
  });
});
