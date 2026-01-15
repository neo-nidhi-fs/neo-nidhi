import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { userId, type, amount } = body;

    // Create transaction
    const transaction = new Transaction({
      userId,
      type,
      amount,
      date: new Date(),
    });
    await transaction.save();

    // Update user balances based on transaction type
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (type === "deposit") {
      user.savingsBalance += amount;
    } else if (type === "loan") {
      user.loanBalance += amount;
    } else if (type === "repayment") {
      user.loanBalance -= amount;
      if (user.loanBalance < 0) user.loanBalance = 0; // prevent negative
    }

    await user.save();

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}


export async function GET() {
  try {
    await dbConnect();
    const transactions = await Transaction.find({}).sort({ date: -1 }); // latest first
    return NextResponse.json({ success: true, data: transactions });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
