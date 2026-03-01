// Services Layer - Single Responsibility Principle
// Each service has ONE reason to change

import { httpClient, IHttpClient } from '@/lib/httpClient';
import { validators } from '@/lib/validators';
import {
  IMPINCredentials,
  ITransferRequest,
  ITransferResponse,
  IApiResponse,
  IChallenge,
  IFDWithdrawInfo,
} from '@/types';

// Service responsible only for MPIN operations
export class MPINService {
  constructor(private httpClient: IHttpClient) {}

  async setMPIN(
    userId: string,
    credentials: IMPINCredentials
  ): Promise<IApiResponse<void>> {
    // Validate input
    const mpinValidation = validators.validateMPIN(credentials.newMPin);
    if (!mpinValidation.valid) {
      return { success: false, error: mpinValidation.error };
    }

    // Call API
    return this.httpClient.post(`/api/users/${userId}/mpin`, {
      newMPin: credentials.newMPin,
      oldMPin: credentials.oldMPin,
    });
  }

  async verifyMPIN(
    userId: string,
    mpin: string
  ): Promise<IApiResponse<{ valid: boolean }>> {
    const mpinValidation = validators.validateMPIN(mpin);
    if (!mpinValidation.valid) {
      return { success: false, error: mpinValidation.error };
    }

    return this.httpClient.post(`/api/users/${userId}/verify-mpin`, { mpin });
  }

  async getMPINStatus(
    userId: string
  ): Promise<IApiResponse<{ hasMPIN: boolean }>> {
    return this.httpClient.get(`/api/users/${userId}/mpin-status`);
  }
}

// Service responsible only for Transfer operations
export class TransferService {
  constructor(private httpClient: IHttpClient) {}

  async transferMoney(
    request: ITransferRequest
  ): Promise<IApiResponse<ITransferResponse>> {
    // Validate inputs
    const amountValidation = validators.validateAmount(request.amount);
    if (!amountValidation.valid) {
      return { success: false, error: amountValidation.error };
    }

    const userValidation = validators.validateUserName(request.toUserName);
    if (!userValidation.valid) {
      return { success: false, error: userValidation.error };
    }

    // Call API with validated data
    return this.httpClient.post('/api/transactions/transfer', {
      fromUserId: request.fromUserId,
      toUserName: request.toUserName?.trim(),
      amount: request.amount,
      mpin: request.mpin,
    });
  }

  async transferToFD(
    userId: string,
    amount: number,
    mpin?: string
  ): Promise<IApiResponse<void>> {
    const amountValidation = validators.validateAmount(amount);
    if (!amountValidation.valid) {
      return { success: false, error: amountValidation.error };
    }

    return this.httpClient.post(`/api/transactions/transfer-fd`, {
      userId,
      amount,
      mpin,
    });
  }

  async withdrawFD(
    userId: string,
    amount: number,
    mpin?: string
  ): Promise<IApiResponse<void>> {
    const amountValidation = validators.validateAmount(amount);
    if (!amountValidation.valid) {
      return { success: false, error: amountValidation.error };
    }

    return this.httpClient.post(`/api/transactions/withdraw-fd`, {
      userId,
      amount,
      mpin,
    });
  }

  async payLoan(
    userId: string,
    amount: number,
    mpin?: string
  ): Promise<IApiResponse<void>> {
    const amountValidation = validators.validateAmount(amount);
    if (!amountValidation.valid) {
      return { success: false, error: amountValidation.error };
    }

    return this.httpClient.post(`/api/transactions/pay-loan`, {
      userId,
      amount,
      mpin,
    });
  }
}

// Service responsible only for Authentication operations
export class AuthService {
  constructor(private httpClient: IHttpClient) {}

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<IApiResponse<void>> {
    const oldValidation = validators.validatePassword(oldPassword);
    if (!oldValidation.valid) {
      return { success: false, error: oldValidation.error };
    }

    const newValidation = validators.validatePassword(newPassword);
    if (!newValidation.valid) {
      return { success: false, error: newValidation.error };
    }

    return this.httpClient.put(`/api/users/${userId}/password`, {
      oldPassword,
      newPassword,
    });
  }

  async getCurrentSession(): Promise<
    IApiResponse<{ user: { id: string; name: string } }>
  > {
    return this.httpClient.get('/api/auth/session');
  }
}

// Service responsible only for QR Code operations
export class QRCodeService {
  constructor(private httpClient: IHttpClient) {}

  async generateQRCode(
    userId: string,
    userName: string
  ): Promise<IApiResponse<{ qrCode: string }>> {
    if (!userId || !userName) {
      return { success: false, error: 'Invalid user data' };
    }

    return this.httpClient.get(`/api/users/${userId}/qr-code`);
  }

  async downloadQRCode(dataUrl: string, fileName: string): Promise<void> {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Service responsible only for User operations
export class UserService {
  constructor(private httpClient: IHttpClient) {}

  async getUserById(
    userId: string
  ): Promise<
    IApiResponse<{
      savingsBalance: number;
      fd: number;
      loanBalance: number;
      mpin?: string | null;
    }>
  > {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    return this.httpClient.get(`/api/users/${userId}`);
  }

  async getFDWithdrawInfo(
    userId: string
  ): Promise<IApiResponse<IFDWithdrawInfo>> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    return this.httpClient.get(`/api/users/${userId}/fd-withdraw-info`);
  }
}

// Service responsible only for Challenge operations
export class ChallengeService {
  constructor(private httpClient: IHttpClient) {}

  async getAllChallenges(): Promise<IApiResponse<IChallenge[]>> {
    return this.httpClient.get('/api/challenges');
  }

  async getUserChallengeParticipations(
    userId: string
  ): Promise<IApiResponse<Array<{ challengeId: string; status: string }>>> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    return this.httpClient.get(`/api/challenges/user/${userId}`);
  }
}

// Service Locator - provides centralized access to all services
// This can be replaced with dependency injection in the future
export class ServiceLocator {
  private static services: Map<string, unknown> = new Map();

  static {
    // Initialize services with httpClient dependency
    ServiceLocator.register('mpin', new MPINService(httpClient));
    ServiceLocator.register('transfer', new TransferService(httpClient));
    ServiceLocator.register('auth', new AuthService(httpClient));
    ServiceLocator.register('qrCode', new QRCodeService(httpClient));
    ServiceLocator.register('user', new UserService(httpClient));
    ServiceLocator.register('challenge', new ChallengeService(httpClient));
  }

  static register(name: string, service: unknown): void {
    ServiceLocator.services.set(name, service);
  }

  static get<T>(name: string): T {
    const service = ServiceLocator.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service as T;
  }

  static getMPINService(): MPINService {
    return ServiceLocator.get<MPINService>('mpin');
  }

  static getTransferService(): TransferService {
    return ServiceLocator.get<TransferService>('transfer');
  }

  static getAuthService(): AuthService {
    return ServiceLocator.get<AuthService>('auth');
  }

  static getQRCodeService(): QRCodeService {
    return ServiceLocator.get<QRCodeService>('qrCode');
  }

  static getUserService(): UserService {
    return ServiceLocator.get<UserService>('user');
  }

  static getChallengeService(): ChallengeService {
    return ServiceLocator.get<ChallengeService>('challenge');
  }
}
