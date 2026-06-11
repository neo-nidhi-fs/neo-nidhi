import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('highcharts', () => ({ default: {} }));
vi.mock('highcharts-react-official', () => ({ default: () => null }));
vi.mock('@/components/charts/LazyHighchartsChart', () => ({
  LazyHighchartsChart: () => null,
}));

import HomePage from './page';
import LoginPage from './login/page';
import AboutPage from './about/page';
import AndroidPage from './android/page';
import AdminDashboardPage from './admin/dashboard/page';
import AdminReportsPage from './admin/reports/page';
import AdminChallengesPage from './admin/challenges/page';
import AdminRegisterPage from './admin/register/page';
import AdminFeatureTogglesPage from './admin/feature-toggles/page';
import UserDashboardPage from './user/dashboard/page';
import UserChallengesPage from './user/challenges/page';
import UserChallengeDetailsPage from './user/challenges/[id]/page';
import OnlineTransferPage from './user/online-transfer/page';
import PersonalFinancePage from './user/personal-finance/page';
import PersonalFinanceManagePage from './user/personal-finance/manage/page';
import PersonalFinanceLiabilityStrategiesPage from './user/personal-finance/liability-strategies/page';
import PersonalFinanceIncomeExpenseReportPage from './user/personal-finance/income-expense-report/page';
import QRTransferPage from './user/qr-transfer/page';
import QuizPage from './user/quiz/page';
import UserReportsPage from './user/reports/page';

async function renderPage(page: JSX.Element) {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(page);
  });
  return result!;
}

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  getSession: vi.fn().mockResolvedValue(null),
  signIn: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: 'challenge-1' }),
}));

describe('Application page render tests', () => {
  let originalFetch: typeof global.fetch | undefined;

  beforeEach(() => {
    originalFetch = global.fetch;

    vi.stubGlobal('fetch', (input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;

      if (url.endsWith('/api/auth/session')) {
        return Promise.resolve(
          new Response(JSON.stringify({ user: null }), { status: 200 })
        );
      }

      if (url.includes('/api/user/reports')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ success: false, error: 'Failed to load reports data' }),
            { status: 200 }
          )
        );
      }

      if (url.endsWith('/api/users')) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: [] }), { status: 200 })
        );
      }

      return Promise.resolve(
        new Response(JSON.stringify({ success: false, data: [] }), {
          status: 200,
        })
      );
    });
  });

  afterEach(() => {
    if (originalFetch) global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders the home page hero', async () => {
    await renderPage(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('renders the login page form', async () => {
    await renderPage(<LoginPage />);
    expect(screen.getByRole('button', { name: /login/i })).toBeTruthy();
  });

  it('renders the about page content', () => {
    render(<AboutPage />);
    expect(screen.getByText(/About/i)).toBeTruthy();
  });

  it('renders the android page content', async () => {
    await renderPage(<AndroidPage />);
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /Install neo-nidhi on Android/i })
      ).toBeTruthy()
    );
  });

  it('renders admin dashboard with access denied when not authenticated', async () => {
    await renderPage(<AdminDashboardPage />);
    await waitFor(() =>
      expect(screen.getByText(/Access denied/i)).toBeTruthy()
    );
  });

  it('renders admin reports page and shows reports error message', async () => {
    await renderPage(<AdminReportsPage />);
    await waitFor(() =>
      expect(screen.getByText(/Failed to load reports data/i)).toBeTruthy()
    );
  });

  it('renders admin challenges page access denied fallback', async () => {
    await renderPage(<AdminChallengesPage />);
    await waitFor(() =>
      expect(screen.getByText(/Access denied/i)).toBeTruthy()
    );
  });

  it('renders admin register page form', async () => {
    await renderPage(<AdminRegisterPage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /register user/i })).toBeTruthy()
    );
  });

  it('renders admin feature toggles page header', async () => {
    await renderPage(<AdminFeatureTogglesPage />);
    await waitFor(() =>
      expect(screen.getByText(/User Feature Toggles/i)).toBeTruthy()
    );
  });

  it('renders user dashboard page fallback text when no user session', async () => {
    await renderPage(<UserDashboardPage />);
    await waitFor(() =>
      expect(screen.getByText(/User not found/i)).toBeTruthy()
    );
  });

  it('renders user challenges page login prompt', async () => {
    await renderPage(<UserChallengesPage />);
    await waitFor(() =>
      expect(screen.getByText(/Please log in to join challenges/i)).toBeTruthy()
    );
  });

  it('renders user challenge detail page login prompt', async () => {
    await renderPage(<UserChallengeDetailsPage />);
    await waitFor(() =>
      expect(screen.getByText(/Please log in to take challenges/i)).toBeTruthy()
    );
  });

  it('renders online transfer page not logged in state', async () => {
    await renderPage(<OnlineTransferPage />);
    await waitFor(() => expect(screen.getByText(/Please log in/i)).toBeTruthy());
  });

  it('renders personal finance pages in loading state without a session', async () => {
    const personalFinancePages = [
      <PersonalFinancePage key="main" />,
      <PersonalFinanceManagePage key="manage" />,
      <PersonalFinanceLiabilityStrategiesPage key="liability" />,
      <PersonalFinanceIncomeExpenseReportPage key="report" />,
    ];

    for (const page of personalFinancePages) {
      const { container } = await renderPage(page);
      await waitFor(() => expect(container.querySelector('svg')).toBeTruthy());
    }
  });

  it('renders QR transfer page login prompt', async () => {
    await renderPage(<QRTransferPage />);
    await waitFor(() => expect(screen.getByText(/Please log in/i)).toBeTruthy());
  });

  it('renders quiz page login prompt', async () => {
    await renderPage(<QuizPage />);
    await waitFor(() => expect(screen.getByText(/Please log in/i)).toBeTruthy());
  });

  it('renders user reports page with failure state', async () => {
    await renderPage(<UserReportsPage />);
    await waitFor(() =>
      expect(screen.getByText(/Failed to load reports data/i)).toBeTruthy()
    );
  });
});

