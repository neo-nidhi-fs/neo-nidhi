# RD maturity transfer plan

## Goal
When an RD plan reaches its tenure end, the accumulated RD principal should be moved from the RD balance into the savings balance automatically.

## Current behavior
The current flow already:
- creates an RD plan with a monthly debit and a maturity date,
- debits the monthly amount from savings on each installment,
- increases the user's RD balance on each installment,
- marks the plan as completed when the final installment is processed.

What is missing is the maturity transfer step that moves the accumulated RD amount into savings at the end of the term.

## Proposed implementation

### 1. Extend the RD plan data model
Update the recurring deposit subdocument in [src/models/User.ts](src/models/User.ts) to track:
- `maturityTransferredAmount` (the principal amount to move at maturity),
- `maturityTransferredAt` (timestamp when the transfer happened),
- `transferredToSavings` (boolean guard to prevent duplicate transfers).

### 2. Initialize the new values when the RD is created
In [src/app/api/transactions/recurring-deposit/route.ts](src/app/api/transactions/recurring-deposit/route.ts):
- set the initial maturity transfer fields to `0`, `null`, and `false`,
- keep the existing first installment behavior unchanged.

### 3. Handle the maturity transfer in the RD cron
In [src/jobs/recurringDepositCron.ts](src/jobs/recurringDepositCron.ts):
- when the final installment is processed and the plan is moving to `completed`,
- calculate the amount that should be moved as the total principal contributed by that plan,
- transfer that amount from the RD balance into savings,
- mark the plan as `closed` (or keep `completed` plus a `transferredToSavings` flag),
- record the transfer in the transaction history so it is visible in the passbook.

### 4. Make the transfer idempotent
Add a guard so the transfer only runs once:
- if `transferredToSavings` is already `true`, skip the transfer,
- if the cron runs again for the same completed plan, no duplicate movement should happen.

### 5. Update the user balance logic
Ensure the balance flow remains consistent:
- `savingsBalance` increases by the matured amount,
- the user's aggregate `rd` balance decreases by the same amount,
- the RD plan is marked as fully settled.

## Suggested transaction record
Use a new transaction entry (or a `deposit`-type entry with metadata) for the maturity transfer so the user can see a clear audit trail such as:
- `type: deposit` or `type: rd_maturity_transfer` if the enum is expanded,
- metadata containing the RD plan ID and maturity details.

## Acceptance criteria
- When the last RD installment is processed, the matured amount is moved to savings automatically.
- The transfer happens only once.
- The RD plan is marked as settled after the transfer.
- The balances and transaction history stay consistent.
