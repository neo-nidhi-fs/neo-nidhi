import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldAlert, TrendingDown } from 'lucide-react';

type Strategy = {
  title: string;
  summary: string;
  action: string;
  bestFor: string;
};

const strategies: Strategy[] = [
  {
    title: 'Debt Avalanche (highest interest first)',
    summary:
      'Pay minimums on all liabilities, then direct extra payment to the one with the highest interest rate.',
    action:
      'Sort liabilities by interest rate descending and auto-pay extra toward #1 every month.',
    bestFor: 'Minimizing total interest paid over time.',
  },
  {
    title: 'Debt Snowball (smallest balance first)',
    summary:
      'Pay minimums on all liabilities, then attack the smallest balance first to get faster wins.',
    action:
      'Sort liabilities by outstanding amount ascending and roll each cleared EMI amount to the next loan.',
    bestFor: 'Staying motivated and building repayment momentum.',
  },
  {
    title: 'Pay more than minimum and target principal',
    summary:
      'Minimum payments often stretch debt timelines. Even small extra principal reduces interest burden.',
    action:
      'Set a fixed extra monthly amount and route bonuses/refunds to principal-only prepayment where allowed.',
    bestFor: 'Credit cards and high-cost personal loans.',
  },
  {
    title: 'Refinance or consolidate selectively',
    summary:
      'A lower APR or better term can reduce total cost, but fees and longer tenure can cancel benefits.',
    action:
      'Compare total repayment cost, processing fee, and prepayment penalties before switching lenders.',
    bestFor: 'Borrowers with improved credit profile or access to lower-rate products.',
  },
  {
    title: 'Use hardship, restructuring, or counseling early',
    summary:
      'If cash flow is tight, contact lender/servicer quickly to explore temporary relief options.',
    action:
      'Ask for revised schedule, hardship plan, or temporary forbearance and get terms in writing.',
    bestFor: 'Income shock, medical events, or short-term payment stress.',
  },
  {
    title: 'Protect progress with automation and guardrails',
    summary:
      'Late fees and revolving new debt slow payoff. Process discipline is as important as strategy.',
    action:
      'Enable auto-pay for due dates, reduce discretionary spend leakages, and avoid adding new high-interest debt.',
    bestFor: 'Anyone managing multiple liabilities and due dates.',
  },
];

const references = [
  {
    label: 'CFPB: How to reduce your debt (avalanche vs snowball)',
    href: 'https://www.consumerfinance.gov/about-us/blog/how-reduce-your-debt/',
  },
  {
    label: 'CFPB: If you cannot pay credit card bills',
    href: 'https://www.consumerfinance.gov/ask-cfpb/what-should-i-do-if-i-cant-pay-my-credit-card-bills-en-1697/',
  },
  {
    label: 'CFPB: Debt consolidation considerations',
    href: 'https://www.consumerfinance.gov/ask-cfpb/what-do-i-need-to-know-if-im-thinking-about-consolidating-my-credit-card-debt-en-1861/',
  },
  {
    label: 'Federal Student Aid: Income-driven repayment options',
    href: 'https://studentaid.gov/articles/faqs-idr-plan//',
  },
  {
    label: 'FTC: Spot scams while getting out of debt',
    href: 'https://consumer.ftc.gov/consumer-alerts/2025/07/spot-scams-while-getting-out-debt',
  },
  {
    label: 'MyCreditUnion.gov: Managing debt basics',
    href: 'https://mycreditunion.gov/manage-your-money/dealing-debt/managing-debt',
  },
];

export default function LiabilityStrategiesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/user/personal-finance"
            className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-cyan-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Personal Finance
          </Link>
        </div>

        <section className="rounded-xl border border-cyan-700/30 bg-slate-900/70 p-6">
          <div className="flex items-start gap-3">
            <TrendingDown className="h-6 w-6 text-cyan-300 mt-1" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Strategies to Reduce Liabilities Faster
              </h1>
              <p className="mt-2 text-slate-300">
                These methods are compiled from public guidance and debt-management resources.
                Pick one approach and follow it consistently for 3 to 6 months before switching.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategies.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-700 bg-slate-900/70 p-5"
            >
              <h2 className="text-lg font-semibold text-cyan-100">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{item.summary}</p>
              <p className="mt-3 text-sm text-slate-200">
                <span className="font-semibold text-white">How to apply: </span>
                {item.action}
              </p>
              <p className="mt-2 text-xs text-cyan-200">
                Best for: {item.bestFor}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-300 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-200">Safety checks before you commit</h3>
              <ul className="mt-2 text-sm text-amber-100/90 space-y-1 list-disc pl-5">
                <li>Avoid any debt relief provider asking for upfront fees.</li>
                <li>Get revised repayment terms in writing before paying anyone.</li>
                <li>Compare total payoff cost, not just lower monthly EMI.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
          <h3 className="text-lg font-semibold">References</h3>
          <ul className="mt-3 space-y-2">
            {references.map((ref) => (
              <li key={ref.href}>
                <a
                  href={ref.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-cyan-200 hover:text-cyan-100 underline"
                >
                  {ref.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
