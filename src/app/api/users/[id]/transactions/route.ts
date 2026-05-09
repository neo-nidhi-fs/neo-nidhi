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
    const { id } = await context.params;

    const allUsers = await User.find({}).select(
      '_id name savingsBalance fd rd loanBalance'
    );
    const allTransactionsAsc = await Transaction.find({}).sort({ date: 1 });
    const snapshotsByTxId = buildTransactionBalanceSnapshots(
      allTransactionsAsc,
      allUsers
    );

    const userTransactions = allTransactionsAsc
      .filter((tx) => String(tx.userId) === id)
      .reverse()
      .map((tx) => {
        const txObject = tx.toObject();
        return {
          ...txObject,
          userBalanceAfterTransaction: snapshotsByTxId.get(String(tx._id)) ?? null,
        };
      });

    return NextResponse.json({ success: true, data: userTransactions });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
