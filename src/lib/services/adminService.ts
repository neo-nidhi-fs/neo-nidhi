/**
 * Admin Service Layer
 * Handles all API calls related to admin operations
 * Following Dependency Inversion Principle
 */

export interface User {
  _id: string;
  name: string;
  age: number;
  savingsBalance: number;
  loanBalance: number;
  fd?: number;
  customInterestRates?: {
    saving?: number | null;
    fd?: number | null;
    loan?: number | null;
  };
}

export interface Scheme {
  _id: string;
  name: string;
  interestRate: number;
}

export interface FdWithdrawInfo {
  matureAmount: number;
  prematureAmount: number;
  totalFd: number;
  matureTransactions: {
    amount: number;
    date: Date;
    yearsOld: number;
  }[];
  prematureTransactions: {
    amount: number;
    date: Date;
    yearsOld: number;
  }[];
}

class AdminService {
  private readonly baseUrl = '';

  // User Operations
  async fetchUsers(): Promise<User[]> {
    const res = await fetch(`${this.baseUrl}/api/users`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return data.data;
  }

  async createUser(name: string, age: number, password: string): Promise<User> {
    const res = await fetch(`${this.baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age, password, role: 'user' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data.data;
  }

  async resetPassword(userId: string): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/api/users/${userId}/reset-password`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
  }

  async updateInterestRates(
    userId: string,
    rates: {
      saving?: number | null;
      fd?: number | null;
      loan?: number | null;
    }
  ): Promise<User['customInterestRates']> {
    const updateData: Record<string, number | null> = {};
    if (rates.saving !== undefined) updateData.saving = rates.saving;
    if (rates.fd !== undefined) updateData.fd = rates.fd;
    if (rates.loan !== undefined) updateData.loan = rates.loan;

    const res = await fetch(
      `${this.baseUrl}/api/users/${userId}/interest-rates`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      }
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.error || 'Failed to update interest rates');
    return data.data;
  }

  // Scheme Operations
  async fetchSchemes(): Promise<Scheme[]> {
    const res = await fetch(`${this.baseUrl}/api/schemes`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch schemes');
    return data.data;
  }

  async createScheme(name: string, interestRate: number): Promise<Scheme> {
    const res = await fetch(`${this.baseUrl}/api/schemes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, interestRate }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create scheme');
    return data.data;
  }

  async updateScheme(
    schemeId: string,
    name: string,
    interestRate: number
  ): Promise<Scheme> {
    const res = await fetch(`${this.baseUrl}/api/schemes/${schemeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, interestRate }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update scheme');
    return data.data;
  }

  async deleteScheme(schemeId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/schemes/${schemeId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete scheme');
  }

  // FD Operations
  async fetchFdWithdrawInfo(userId: string): Promise<FdWithdrawInfo> {
    const res = await fetch(
      `${this.baseUrl}/api/transactions/withdraw-fd?userId=${userId}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch FD info');
    return data.data;
  }

  async withdrawFd(
    userId: string,
    amount: number
  ): Promise<{ message: string }> {
    const res = await fetch(`${this.baseUrl}/api/transactions/withdraw-fd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to withdraw FD');
    return data;
  }
}

export const adminService = new AdminService();
