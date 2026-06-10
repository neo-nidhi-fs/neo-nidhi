import { describe, it, expect } from 'vitest';
import { validators } from './validators';

describe('validators', () => {
  describe('validateMPIN', () => {
    it('returns invalid when mpin is missing', () => {
      expect(validators.validateMPIN(undefined)).toEqual({
        valid: false,
        error: 'MPIN is required',
      });
    });

    it('returns invalid when mpin length is not 4', () => {
      expect(validators.validateMPIN('123')).toEqual({
        valid: false,
        error: 'MPIN must be 4 digits',
      });
      expect(validators.validateMPIN('12345')).toEqual({
        valid: false,
        error: 'MPIN must be 4 digits',
      });
    });

    it('returns invalid when mpin contains non-digit characters', () => {
      expect(validators.validateMPIN('12a4')).toEqual({
        valid: false,
        error: 'MPIN must contain only digits',
      });
    });

    it('returns valid for a proper 4-digit mpin', () => {
      expect(validators.validateMPIN('1234')).toEqual({ valid: true });
    });
  });

  describe('validateAmount', () => {
    it('rejects zero or negative amounts', () => {
      expect(validators.validateAmount(0)).toEqual({
        valid: false,
        error: 'Amount must be greater than 0',
      });
      expect(validators.validateAmount(-5)).toEqual({
        valid: false,
        error: 'Amount must be greater than 0',
      });
    });

    it('rejects non-finite values', () => {
      expect(validators.validateAmount(Number.POSITIVE_INFINITY)).toEqual({
        valid: false,
        error: 'Invalid amount',
      });
    });

    it('accepts positive finite amounts', () => {
      expect(validators.validateAmount(100)).toEqual({ valid: true });
    });
  });

  describe('validateUserName', () => {
    it('rejects empty or missing user names', () => {
      expect(validators.validateUserName(undefined)).toEqual({
        valid: false,
        error: 'Invalid user name',
      });
      expect(validators.validateUserName('   ')).toEqual({
        valid: false,
        error: 'User name cannot be empty',
      });
    });

    it('accepts valid trimmed names', () => {
      expect(validators.validateUserName(' Alice ')).toEqual({ valid: true });
    });
  });

  describe('validatePassword', () => {
    it('rejects missing passwords', () => {
      expect(validators.validatePassword('')).toEqual({
        valid: false,
        error: 'Password is required',
      });
    });

    it('accepts non-empty passwords', () => {
      expect(validators.validatePassword('securePassword')).toEqual({
        valid: true,
      });
    });
  });

  describe('validateSufficientBalance', () => {
    it('rejects when balance is lower than amount', () => {
      expect(validators.validateSufficientBalance(100, 200)).toEqual({
        valid: false,
        error: 'Insufficient balance',
      });
    });

    it('accepts when balance is sufficient', () => {
      expect(validators.validateSufficientBalance(200, 100)).toEqual({
        valid: true,
      });
    });
  });
});
