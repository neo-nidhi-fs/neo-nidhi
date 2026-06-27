import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Transaction } from '@/models/Transaction';
import { User } from '@/models/User';
import { buildTransactionBalanceSnapshots } from '@/lib/transactionBalanceSnapshots';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const limitParam = Number(url.searchParams.get('limit') ?? '10');
    const page = Math.max(1, pageParam);
    const limit = Math.max(1, Math.min(limitParam, 100));
    const { id } = await context.params;

    const user = await User.findById(id)
      .select('_id name savingsBalance fd rd loanBalance')
      .lean();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userTransactionsAsc = await Transaction.find({ userId: id })
      .select('userId type amount date relatedUserId relatedUserName metadata')
      .sort({ date: 1 })
      .lean();
    const snapshotsByTxId = buildTransactionBalanceSnapshots(
      userTransactionsAsc,
      [user]
    );
    const balanceColumns = {
      fd:
        (user.fd ?? 0) > 0 ||
        userTransactionsAsc.some((tx) =>
          ['fd', 'interest_fd', 'withdrawal_fd'].includes(tx.type)
        ),
      rd:
        (user.rd ?? 0) > 0 ||
        userTransactionsAsc.some((tx) =>
          ['rd', 'interest_rd'].includes(tx.type)
        ),
      loan:
        (user.loanBalance ?? 0) > 0 ||
        userTransactionsAsc.some((tx) =>
          ['loan', 'repayment', 'interest_loan'].includes(tx.type)
        ),
    };

    const mappedTransactions = [...userTransactionsAsc].reverse().map((tx) => ({
      ...tx,
      userBalanceAfterTransaction: snapshotsByTxId.get(String(tx._id)) ?? null,
    }));

    const total = mappedTransactions.length;
    const totalAmount = mappedTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );
    const paginatedTransactions = mappedTransactions.slice(
      (page - 1) * limit,
      page * limit
    );

    return NextResponse.json({
      success: true,
      data: paginatedTransactions,
      total,
      totalAmount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      balanceColumns,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
