import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";

// POST: Add a transaction (deposit, loan, repayment)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const transaction = new Transaction({
      userId: body.userId,
      type: body.type, // "deposit" | "loan" | "repayment"
      amount: body.amount,
    });

    await transaction.save();

    // Update user balances
    const user = await User.findById(body.userId);
    if (user) {
      if (body.type === "deposit") {
        user.savingsBalance += body.amount;
      } else if (body.type === "loan") {
        user.loanBalance += body.amount;
      } else if (body.type === "repayment") {
        user.loanBalance -= body.amount;
      }
      await user.save();
    }

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}