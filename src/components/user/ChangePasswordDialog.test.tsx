import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangePasswordDialog } from './ChangePasswordDialog';

const mockChangePassword = vi.fn();

vi.mock('../../lib/services', () => ({
  ServiceLocator: {
    getAuthService: () => ({
      changePassword: mockChangePassword,
    }),
  },
}));

describe('ChangePasswordDialog', () => {
  beforeEach(() => {
    mockChangePassword.mockReset();
  });

  it('submits password form and shows success message', async () => {
    mockChangePassword.mockResolvedValue({ success: true, message: 'Password updated successfully' });

    render(<ChangePasswordDialog userId="user-1" />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /change password/i }));
    await user.type(screen.getByLabelText(/old password/i), 'oldpass');
    await user.type(screen.getByLabelText(/new password/i), 'newpass');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => expect(mockChangePassword).toHaveBeenCalledWith('user-1', 'oldpass', 'newpass'));
    await waitFor(() => expect(screen.getByText(/✅ Password updated successfully/i)).toBeInTheDocument());
  });

  it('shows an error message when changePassword fails', async () => {
    mockChangePassword.mockResolvedValue({ success: false, error: 'Unable to update' });

    render(<ChangePasswordDialog userId="user-1" />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /change password/i }));
    await user.type(screen.getByLabelText(/old password/i), 'oldpass');
    await user.type(screen.getByLabelText(/new password/i), 'newpass');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => expect(mockChangePassword).toHaveBeenCalledWith('user-1', 'oldpass', 'newpass'));
    await waitFor(() => expect(screen.queryByText(/✅/)).not.toBeInTheDocument());
  });
});
