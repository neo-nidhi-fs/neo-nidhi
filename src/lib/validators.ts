// Validation logic - Single Responsibility: Input Validation
// Following SRP: This module only handles validation

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validators = {
  // Validate MPIN format
  validateMPIN: (
    mpin: string | undefined
  ): { valid: boolean; error?: string } => {
    if (!mpin) {
      return { valid: false, error: 'MPIN is required' };
    }
    if (mpin.length !== 4) {
      return { valid: false, error: 'MPIN must be 4 digits' };
    }
    if (!/^\d+$/.test(mpin)) {
      return { valid: false, error: 'MPIN must contain only digits' };
    }
    return { valid: true };
  },

  // Validate transfer amount
  validateAmount: (amount: number): { valid: boolean; error?: string } => {
    if (!amount || amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }
    if (!Number.isFinite(amount)) {
      return { valid: false, error: 'Invalid amount' };
    }
    return { valid: true };
  },

  // Validate user name
  validateUserName: (
    name: string | undefined
  ): { valid: boolean; error?: string } => {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Invalid user name' };
    }
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'User name cannot be empty' };
    }
    return { valid: true };
  },

  // Validate password
  validatePassword: (password: string): { valid: boolean; error?: string } => {
    if (!password) {
      return { valid: false, error: 'Password is required' };
    }
    if (password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters' };
    }
    return { valid: true };
  },

  // Validate balance sufficiency
  validateSufficientBalance: (
    balance: number,
    amount: number
  ): { valid: boolean; error?: string } => {
    if (balance < amount) {
      return { valid: false, error: 'Insufficient balance' };
    }
    return { valid: true };
  },
};
