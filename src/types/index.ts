// Domain types and interfaces following Interface Segregation Principle
export interface IUserCredentials {
  email?: string;
  name?: string;
  password: string;
}

export interface IMPINCredentials {
  newMPin: string;
  oldMPin?: string;
}

export interface ITransferRequest {
  fromUserId: string;
  toUserName: string;
  amount: number;
  mpin?: string;
}

export interface ITransferResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface IBalance {
  savingsBalance: number;
  fd: number;
  loanBalance: number;
  accruedSavingInterest: number;
  accruedFdInterest: number;
  accruedLoanInterest: number;
}

export interface IUserProfile {
  _id: string;
  name: string;
  age: number;
  role: 'admin' | 'user';
  createdAt: Date;
  mpin?: string | null;
  qrCode?: string | null;
}

export interface IScanResult {
  userId: string;
  userName: string;
  type: string;
}

export interface IChallenge {
  _id: string;
  title: string;
  totalPrizePool: number;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IFDWithdrawInfo {
  matureAmount: number;
  prematureAmount: number;
  totalFd: number;
  matureTransactions: Array<{ _id: string; principal: number }>;
  prematureTransactions: Array<{ _id: string; principal: number }>;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
