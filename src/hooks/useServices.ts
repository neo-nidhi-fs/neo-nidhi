'use client';

// Custom hooks - Single Responsibility Principle
// Each hook handles ONE concern

import { useState, useCallback } from 'react';
import { ServiceLocator } from '@/lib/services';
import { ITransferRequest, IChallenge } from '@/types';

// Hook for handling MPIN operations
export function useMPIN(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mpinService = ServiceLocator.getMPINService();

  const setMPIN = useCallback(
    async (newMPin: string, oldMPin?: string) => {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await mpinService.setMPIN(userId, { newMPin, oldMPin });
      setLoading(false);

      if (result.success) {
        setSuccess(result.message || 'MPIN updated successfully');
        return true;
      } else {
        setError(result.error || 'Failed to update MPIN');
        return false;
      }
    },
    [userId, mpinService]
  );

  const verifyMPIN = useCallback(
    async (mpin: string) => {
      setLoading(true);
      setError('');

      const result = await mpinService.verifyMPIN(userId, mpin);
      setLoading(false);

      if (!result.success) {
        setError(result.error || 'MPIN verification failed');
        return false;
      }

      return result.data?.valid || false;
    },
    [userId, mpinService]
  );

  return { setMPIN, verifyMPIN, loading, error, success };
}

// Hook for handling transfer operations
export function useTransfer(fromUserId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const transferService = ServiceLocator.getTransferService();

  const transfer = useCallback(
    async (request: ITransferRequest) => {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await transferService.transferMoney(request);
      setLoading(false);

      if (result.success) {
        setSuccess(result.message || 'Transfer successful');
        return true;
      } else {
        setError(result.error || 'Transfer failed');
        return false;
      }
    },
    [transferService]
  );

  const transferToFD = useCallback(
    async (amount: number, mpin?: string) => {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await transferService.transferToFD(
        fromUserId,
        amount,
        mpin
      );
      setLoading(false);

      if (result.success) {
        setSuccess(result.message || 'Transfer to FD successful');
        return true;
      } else {
        setError(result.error || 'Transfer to FD failed');
        return false;
      }
    },
    [fromUserId, transferService]
  );

  const withdrawFD = useCallback(
    async (amount: number, mpin?: string) => {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await transferService.withdrawFD(fromUserId, amount, mpin);
      setLoading(false);

      if (result.success) {
        setSuccess(result.message || 'FD withdrawal successful');
        return true;
      } else {
        setError(result.error || 'FD withdrawal failed');
        return false;
      }
    },
    [fromUserId, transferService]
  );

  const payLoan = useCallback(
    async (amount: number, mpin?: string) => {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await transferService.payLoan(fromUserId, amount, mpin);
      setLoading(false);

      if (result.success) {
        setSuccess(result.message || 'Loan payment successful');
        return true;
      } else {
        setError(result.error || 'Loan payment failed');
        return false;
      }
    },
    [fromUserId, transferService]
  );

  return {
    transfer,
    transferToFD,
    withdrawFD,
    payLoan,
    loading,
    error,
    success,
  };
}

// Hook for handling password operations
export function useAuthPassword(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authService = ServiceLocator.getAuthService();

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await authService.changePassword(
        userId,
        oldPassword,
        newPassword
      );
      setLoading(false);

      if (result.success) {
        setSuccess(result.message || 'Password updated successfully');
        return true;
      } else {
        setError(result.error || 'Failed to change password');
        return false;
      }
    },
    [userId, authService]
  );

  return { changePassword, loading, error, success };
}

// Hook for handling QR code operations
export function useQRCode(userId: string, userName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQRCode] = useState<string | null>(null);

  const qrCodeService = ServiceLocator.getQRCodeService();

  const generateQR = useCallback(async () => {
    setLoading(true);
    setError('');

    const result = await qrCodeService.generateQRCode(userId, userName);
    setLoading(false);

    if (result.success && result.data?.qrCode) {
      setQRCode(result.data.qrCode);
      return true;
    } else {
      setError(result.error || 'Failed to generate QR code');
      return false;
    }
  }, [userId, userName, qrCodeService]);

  const downloadQR = useCallback(
    (fileName?: string) => {
      if (qrCode) {
        qrCodeService.downloadQRCode(qrCode, fileName || 'qr-code.png');
      }
    },
    [qrCode, qrCodeService]
  );

  return { generateQR, downloadQR, qrCode, loading, error };
}

// Hook for handling user operations
export function useUser(userId: string) {
  const [user, setUser] = useState<{
    savingsBalance: number;
    fd: number;
    loanBalance: number;
    mpin?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userService = ServiceLocator.getUserService();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError('');

    const result = await userService.getUserById(userId);
    setLoading(false);

    if (result.success && result.data) {
      setUser(result.data);
      return true;
    } else {
      setError(result.error || 'Failed to fetch user');
      return false;
    }
  }, [userId, userService]);

  const getFDWithdrawInfo = useCallback(async () => {
    setLoading(true);
    setError('');

    const result = await userService.getFDWithdrawInfo(userId);
    setLoading(false);

    if (result.success) {
      return result.data;
    } else {
      setError(result.error || 'Failed to fetch FD withdraw info');
      return null;
    }
  }, [userId, userService]);

  return { user, fetchUser, getFDWithdrawInfo, loading, error };
}

// Hook for handling challenges
export function useChallenges(userId: string) {
  const [challenges, setChallenges] = useState<IChallenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<IChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const challengeService = ServiceLocator.getChallengeService();

  const fetchActiveChallenges = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch all challenges
      const challengesResult = await challengeService.getAllChallenges();
      if (!challengesResult.success) {
        setError(challengesResult.error || 'Failed to fetch challenges');
        setLoading(false);
        return;
      }

      // Fetch user participations
      const participationsResult =
        await challengeService.getUserChallengeParticipations(userId);
      if (!participationsResult.success) {
        setError(
          participationsResult.error || 'Failed to fetch participations'
        );
        setLoading(false);
        return;
      }

      const allChallenges = challengesResult.data || [];
      const userParticipations = participationsResult.data || [];
      const userChallengeIds = userParticipations.map((p) => p.challengeId);

      // Filter active challenges
      const active = allChallenges.filter((challenge) =>
        userChallengeIds.includes(challenge._id)
      );

      setChallenges(allChallenges);
      setActiveChallenges(active);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId, challengeService]);

  return {
    challenges,
    activeChallenges,
    fetchActiveChallenges,
    loading,
    error,
  };
}
