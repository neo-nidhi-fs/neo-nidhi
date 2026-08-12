import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Transaction } from '@/models/Transaction';
import { User } from '@/models/User';
import { Scheme } from '@/models/Scheme';
import { recalculateBalances } from '@/utils/recalculateBalance';
import { buildTransactionBalanceSnapshots } from '@/lib/transactionBalanceSnapshots';
import {
  canManageUser,
  getManagedUsersFilter,
  requireAdminLikeAccess,
} from '@/lib/adminAccess';
import { Types } from 'mongoose';

interface TransactionFilter {
  userId?: { $in: Types.ObjectId[] }; // Adjust string[] if userIds is number[], etc.
  type?: string;
  date?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const accessResult = await requireAdminLikeAccess();
    if (!accessResult.ok) {
      return accessResult.response;
    }

    const body = await req.json();

    const { userId, type, amount } = body;

    // Validation
    if (!userId || !type || amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const validTypes = [
      'deposit',
      'withdrawal',
      'loan',
      'repayment',
      'fd',
      'rd',
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid transaction type: ${type}` },
        { status: 400 }
      );
    }
    if (!canManageUser(accessResult.context, userId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Validation for specific transaction types
    if (type === 'withdrawal') {
      const { savingsBalance } = user;
      console.log('currentBalances ==> ', savingsBalance, amount);
      if (savingsBalance < amount) {
        return NextResponse.json(
          { success: false, error: 'Insufficient savings balance' },
          { status: 400 }
        );
      }
    }

    if (type === 'repayment') {
      const currentBalances = await recalculateBalances(userId);
      if (currentBalances.loanBalance < amount) {
        return NextResponse.json(
          { success: false, error: 'Repayment amount exceeds loan balance' },
          { status: 400 }
        );
      }

      if (currentBalances.savingsBalance < amount) {
        return NextResponse.json(
          { success: false, error: 'Insufficient savings balance' },
          { status: 400 }
        );
      }
    }

    let metadata: Record<string, unknown> | undefined;
    if (type === 'rd') {
      if (user.savingsBalance < amount) {
        return NextResponse.json(
          { success: false, error: 'Insufficient savings balance' },
          { status: 400 }
        );
      }

      const tenureMonths =
        body.tenureMonths === undefined || body.tenureMonths === ''
          ? undefined
          : Number(body.tenureMonths);
      if (
        tenureMonths !== undefined &&
        (!Number.isInteger(tenureMonths) || tenureMonths <= 0)
      ) {
        return NextResponse.json(
          { success: false, error: 'RD tenure must be greater than 0 months' },
          { status: 400 }
        );
      }

      const rdScheme = await Scheme.findOne({ name: 'rd' });

      const selectedTenureMonths = tenureMonths ?? rdScheme?.tenureMonths;
      if (selectedTenureMonths) {
        const maturityDate = new Date();
        maturityDate.setMonth(maturityDate.getMonth() + selectedTenureMonths);
        metadata = {
          monthlyAmount: amount,
          tenureMonths: selectedTenureMonths,
          maturityDate: maturityDate.toISOString(),
        };
      }
    }

    // Create transaction
    const transaction = new Transaction({
      userId,
      type,
      amount,
      date: new Date(),
      metadata,
    });
    await transaction.save();

    // Recalculate balances from all transactions
    const newBalances = await recalculateBalances(userId);

    // Update user balances
    user.savingsBalance = newBalances.savingsBalance;
    user.fd = newBalances.fdBalance;
    user.rd = newBalances.rdBalance;
    user.loanBalance = newBalances.loanBalance;
    await user.save();
    return NextResponse.json(
      {
        success: true,
        data: transaction,
        balances: {
          savingsBalance: user.savingsBalance,
          fdBalance: user.fd,
          rdBalance: user.rd,
          loanBalance: user.loanBalance,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error creating transaction:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const accessResult = await requireAdminLikeAccess();
    if (!accessResult.ok) {
      return accessResult.response;
    }

    const url = new URL(req.url);
    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const limitParam = Number(url.searchParams.get('limit') ?? '10');
    const typeFilter = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const page = Math.max(1, pageParam);
    const limit = Math.max(1, Math.min(limitParam, 100));

    const userFilter = getManagedUsersFilter(accessResult.context);
    const users = await User.find(userFilter).select('_id').lean();
    const userIds = users.map((user) => user._id);
    const filter: TransactionFilter = accessResult.context.isAdmin
      ? {}
      : { userId: { $in: userIds } };
    if (typeFilter) {
      filter.type = typeFilter; // Cast as it's a string from URL
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactionsAsc = await Transaction.find(filter)
      .select('userId type amount date relatedUserId relatedUserName metadata')
      .sort({ date: 1 })
      .lean();
    const visibleUsers = await User.find(userFilter)
      .select('_id name savingsBalance fd rd loanBalance')
      .lean();
    const snapshotsByTxId = buildTransactionBalanceSnapshots(
      transactionsAsc,
      visibleUsers
    );

    const allTransactions = [...transactionsAsc].reverse().map((tx) => {
      return {
        ...tx,
        userBalanceAfterTransaction:
          snapshotsByTxId.get(String(tx._id)) ?? null,
      };
    });

    const total = allTransactions.length;
    const totalAmount = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const paginated = allTransactions.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      total,
      totalAmount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
