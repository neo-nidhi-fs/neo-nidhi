import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQRCode } from './useServices';

const mockGenerateQRCode = vi.fn();
const mockDownloadQRCode = vi.fn();

vi.mock('../lib/services', () => ({
  ServiceLocator: {
    getQRCodeService: () => ({
      generateQRCode: mockGenerateQRCode,
      downloadQRCode: mockDownloadQRCode,
    }),
  },
}));

function QRCodeHookTest() {
  const { generateQR, downloadQR, qrCode, loading, error } = useQRCode('user-1', 'Alice');

  return (
    <div>
      <button type="button" onClick={() => generateQR()}>
        Generate QR
      </button>
      <button type="button" onClick={() => downloadQR('qr.png')}>
        Download QR
      </button>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error}</span>
      <span data-testid="qrCode">{qrCode ?? ''}</span>
    </div>
  );
}

describe('useQRCode', () => {
  beforeEach(() => {
    mockGenerateQRCode.mockReset();
    mockDownloadQRCode.mockReset();
  });

  it('sets qrCode after successful generateQR', async () => {
    mockGenerateQRCode.mockResolvedValue({ success: true, data: { qrCode: 'https://example.com/qr' } });

    render(<QRCodeHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /generate qr/i }));

    await waitFor(() => expect(mockGenerateQRCode).toHaveBeenCalledWith('user-1', 'Alice'));
    await waitFor(() => expect(screen.getByTestId('qrCode')).toHaveTextContent('https://example.com/qr'));
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('calls downloadQRCode when qrCode exists', async () => {
    mockGenerateQRCode.mockResolvedValue({ success: true, data: { qrCode: 'https://example.com/qr' } });

    render(<QRCodeHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /generate qr/i }));
    await waitFor(() => expect(screen.getByTestId('qrCode')).toHaveTextContent('https://example.com/qr'));

    await user.click(screen.getByRole('button', { name: /download qr/i }));
    expect(mockDownloadQRCode).toHaveBeenCalledWith('https://example.com/qr', 'qr.png');
  });

  it('shows error message when generateQR fails', async () => {
    mockGenerateQRCode.mockResolvedValue({ success: false, error: 'Unable to generate QR' });

    render(<QRCodeHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /generate qr/i }));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Unable to generate QR'));
    expect(screen.getByTestId('qrCode')).toHaveTextContent('');
  });
});
