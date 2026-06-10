import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useChallenges } from './useServices';

const mockGetAllChallenges = vi.fn();
const mockGetUserChallengeParticipations = vi.fn();

vi.mock('../lib/services', () => ({
  ServiceLocator: {
    getChallengeService: () => ({
      getAllChallenges: mockGetAllChallenges,
      getUserChallengeParticipations: mockGetUserChallengeParticipations,
    }),
  },
}));

function ChallengesHookTest() {
  const { challenges, activeChallenges, fetchActiveChallenges, loading, error } = useChallenges('user-1');

  return (
    <div>
      <button type="button" onClick={() => fetchActiveChallenges()}>
        Fetch Challenges
      </button>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error}</span>
      <span data-testid="challengeCount">{challenges.length}</span>
      <span data-testid="activeChallengeCount">{activeChallenges.length}</span>
    </div>
  );
}

describe('useChallenges', () => {
  beforeEach(() => {
    mockGetAllChallenges.mockReset();
    mockGetUserChallengeParticipations.mockReset();
  });

  it('fetches all challenges and active participations', async () => {
    mockGetAllChallenges.mockResolvedValue({
      success: true,
      data: [
        { _id: 'c1', title: 'Challenge 1', totalPrizePool: 100, description: 'Test', startDate: new Date(), endDate: new Date() },
        { _id: 'c2', title: 'Challenge 2', totalPrizePool: 200, description: 'Test', startDate: new Date(), endDate: new Date() },
      ],
    });
    mockGetUserChallengeParticipations.mockResolvedValue({
      success: true,
      data: [{ challengeId: 'c2' }],
    });

    render(<ChallengesHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /fetch challenges/i }));

    await waitFor(() => expect(mockGetAllChallenges).toHaveBeenCalled());
    await waitFor(() => expect(mockGetUserChallengeParticipations).toHaveBeenCalledWith('user-1'));
    await waitFor(() => expect(screen.getByTestId('challengeCount')).toHaveTextContent('2'));
    await waitFor(() => expect(screen.getByTestId('activeChallengeCount')).toHaveTextContent('1'));
  });

  it('sets error when participation fetch fails', async () => {
    mockGetAllChallenges.mockResolvedValue({ success: true, data: [{ _id: 'c1', title: 'Challenge 1', totalPrizePool: 100, description: 'Test', startDate: new Date(), endDate: new Date() }] });
    mockGetUserChallengeParticipations.mockResolvedValue({ success: false, error: 'Participation error' });

    render(<ChallengesHookTest />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /fetch challenges/i }));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Participation error'));
  });
});
