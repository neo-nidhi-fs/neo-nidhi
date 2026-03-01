// Transfer API Endpoints
export const TRANSFER_ENDPOINTS = {
  TRANSFER: '/api/transactions/transfer',
  FETCH_USER: '/api/users',
  QR_TRANSFER: '/api/transactions/transfer',
  FD_TRANSFER: '/api/transactions/transfer-fd',
  WITHDRAW_FD: '/api/transactions/withdraw-fd',
} as const;

// Transfer Constants
export const TRANSFER_CONFIG = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 10000000,
  MPIN_LENGTH: 4,
  RESET_DELAY: 2000, // milliseconds
} as const;

// Transfer Messages
export const TRANSFER_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  INVALID_AMOUNT: 'Please enter a valid amount',
  SUCCESS: '✅',
  TRANSFER_SUCCESS: 'Transfer successful',
  NOT_LOGGED_IN: 'Please log in to transfer money',
} as const;

// Transaction Types
export const TRANSACTION_TYPES = {
  TRANSFER: 'transfer',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  INTEREST: 'interest',
  LOAN: 'loan',
} as const;

// Transaction Status
export const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed',
} as const;
