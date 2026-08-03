export const INCOME_CATEGORIES = [
  'Salary',
  'Bonus',
  'Freelance',
  'Investment',
  'Investment Returns',
  'Interest',
  'Dividends',
  'UPI Credit',
  'Business',
  'Rental Income',
  'EMI contribution',
  'Other Income',
] as const;

export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Utilities',
  'Rent',
  'Transportation',
  'Healthcare',
  'Business',
  'Entertainment',
  'Dining',
  'UPI Payment',
  'Personal',
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
