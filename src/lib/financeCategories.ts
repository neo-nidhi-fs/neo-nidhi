export const INCOME_CATEGORIES = [
  'Salary',
  'Bonus',
  'Freelance',
  'Investment',
  'Investment Returns',
  'Interest',
  'Dividends',
  'Rental Income',
  'Other Income',
] as const;

export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Utilities',
  'Rent',
  'Transportation',
  'Healthcare',
  'Entertainment',
  'Dining',
  'Credit Card Payments',
  'Gifts/Donations',
  'part payment of loan',
  'Shopping',
  'Insurance',
  'Investment',
  'EMI/Loan',
  'Other Expense',
] as const;

export const ALL_CASHFLOW_CATEGORIES = Array.from(
  new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])
);
