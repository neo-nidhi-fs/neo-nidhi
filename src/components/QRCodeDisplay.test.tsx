import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRCodeDisplay from './QRCodeDisplay';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

const mockGenerateQR = vi.fn();
const mockDownloadQR = vi.fn();

vi.mock('../lib/services', () => ({
  ServiceLocator: {
    getQRCodeService: () => ({
      generateQRCode: mockGenerateQR,
      downloadQRCode: mockDownloadQR,
    }),
  },
}));

describe('QRCodeDisplay', () => {
  beforeEach(() => {
    mockGenerateQR.mockReset();
    mockDownloadQR.mockReset();
  });

  it('renders QR code and download button when qrCode is available', async () => {
    mockGenerateQR.mockResolvedValue({
      success: true,
      data: { qrCode: 'https://example.com/qr.png' },
    });

    render(<QRCodeDisplay userId="user-1" userName="Alice" />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /my qr code/i }));

    await waitFor(() => expect(screen.getByRole('img', { name: /qr code/i })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /download qr code/i })).toBeInTheDocument();
  });

  it('calls downloadQR when the button is clicked', async () => {
    mockGenerateQR.mockResolvedValue({
      success: true,
      data: { qrCode: 'https://example.com/qr.png' },
    });

    render(<QRCodeDisplay userId="user-1" userName="Alice" />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /my qr code/i }));
    await waitFor(() => screen.getByRole('button', { name: /download qr code/i }));

    await user.click(screen.getByRole('button', { name: /download qr code/i }));
    expect(mockDownloadQR).toHaveBeenCalledWith('https://example.com/qr.png', 'Alice-qr-code.png');
  });
});
