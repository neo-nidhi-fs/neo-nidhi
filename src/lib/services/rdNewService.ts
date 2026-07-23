import { IHttpClient } from '@/lib/httpClient';
import { IApiResponse } from '@/types';

export interface IRDScheme {
  _id: string;
  name: string;
  description?: string;
  interestRate: number;
  tenureMonths: number;
  minMonthlyAmount: number;
  maxMonthlyAmount?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IRDSubscription {
  _id: string;
  userId: string;
  schemeId: IRDScheme | string;
  monthlyAmount: number;
  mandateDay: number;
  startDate: string;
  nextDebitDate: string;
  maturityDate: string;
  installmentsPaid: number;
  totalDebited: number;
  accruedInterest: number;
  status: 'active' | 'completed' | 'missed' | 'closed';
  missedInstallments: number;
  lastDebitDate?: string | null;
  closedAt?: string | null;
  closedBy?: string | null;
  maturityAmount?: number | null;
  maturityTransferredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateSchemeRequest {
  name: string;
  description?: string;
  interestRate: number;
  tenureMonths: number;
  minMonthlyAmount: number;
  maxMonthlyAmount?: number | null;
  isActive?: boolean;
}

export interface ICreateSubscriptionRequest {
  userId: string;
  schemeId: string;
  monthlyAmount: number;
  mandateDay: number;
}

export class RDNewService {
  constructor(private httpClient: IHttpClient) {}

  async fetchSchemes(): Promise<IApiResponse<IRDScheme[]>> {
    return this.httpClient.get<IRDScheme[]>('/api/admin/rd-schemes');
  }

  async createScheme(
    data: ICreateSchemeRequest
  ): Promise<IApiResponse<IRDScheme>> {
    if (!data.name?.trim()) {
      return { success: false, error: 'Scheme name is required' };
    }
    if (data.interestRate < 0) {
      return { success: false, error: 'Interest rate must be non-negative' };
    }
    if (data.tenureMonths < 1) {
      return { success: false, error: 'Tenure must be at least 1 month' };
    }
    if (data.minMonthlyAmount < 1) {
      return {
        success: false,
        error: 'Minimum monthly amount must be at least 1',
      };
    }
    return this.httpClient.post<IRDScheme>('/api/admin/rd-schemes', data);
  }

  async updateScheme(
    schemeId: string,
    data: Partial<ICreateSchemeRequest>
  ): Promise<IApiResponse<IRDScheme>> {
    return this.httpClient.put<IRDScheme>(
      `/api/admin/rd-schemes/${schemeId}`,
      data
    );
  }

  async deleteScheme(schemeId: string): Promise<IApiResponse<void>> {
    // Use a raw fetch for DELETE since httpClient doesn't expose delete
    try {
      const res = await fetch(`/api/admin/rd-schemes/${schemeId}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok)
        return { success: false, error: result.error || 'Delete failed' };
      return { success: true, message: result.message };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async fetchSubscriptions(
    userId?: string
  ): Promise<IApiResponse<IRDSubscription[]>> {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.httpClient.get<IRDSubscription[]>(`/api/rd-subscriptions${qs}`);
  }

  async createSubscription(
    data: ICreateSubscriptionRequest
  ): Promise<IApiResponse<IRDSubscription>> {
    if (!data.userId || !data.schemeId) {
      return { success: false, error: 'userId and schemeId are required' };
    }
    if (data.monthlyAmount < 1) {
      return { success: false, error: 'Monthly amount must be at least 1' };
    }
    if (data.mandateDay < 1 || data.mandateDay > 28) {
      return { success: false, error: 'Mandate day must be between 1 and 28' };
    }
    return this.httpClient.post<IRDSubscription>('/api/rd-subscriptions', data);
  }

  async closeSubscription(
    subscriptionId: string
  ): Promise<
    IApiResponse<{ maturityAmount: number; newSavingsBalance: number }>
  > {
    return this.httpClient.post<{
      maturityAmount: number;
      newSavingsBalance: number;
    }>(`/api/rd-subscriptions/${subscriptionId}/close`, {});
  }

  async deleteSubscription(
    subscriptionId: string
  ): Promise<IApiResponse<void>> {
    try {
      const res = await fetch(`/api/rd-subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok)
        return { success: false, error: result.error || 'Delete failed' };
      return { success: true, message: result.message };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
}
