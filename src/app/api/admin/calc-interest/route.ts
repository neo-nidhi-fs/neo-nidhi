import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { calculateMonthlyInterest } from "@/utils/interestCalculator";

export async function POST() {
  try {
    await dbConnect();
    const today = new Date();

    const users = await User.find({});

    for (const user of users) {
      // Skip if already calculated this month
      if (
        user.lastInterestCalc &&
        user.lastInterestCalc.getMonth() === today.getMonth() &&
        user.lastInterestCalc.getFullYear() === today.getFullYear()
      ) {
        continue;
      }

      // Example: calculate interest on savings + loan
      const savingsInterest = calculateMonthlyInterest(
        "saving",
        user.savingsBalance,
        3.5, // assume 3.5% annual
        user.lastInterestCalc || user.createdAt,
        today
      );

      const loanInterest = calculateMonthlyInterest(
        "loan",
        user.loanBalance,
        12,
        user.lastInterestCalc || user.createdAt,
        today
      );
      const fdInterest = calculateMonthlyInterest(
        "fd",
        user.fd,
        8,
        user.lastInterestCalc || user.createdAt,
        today
      );

      // Add transactions
      if (savingsInterest > 0) {
        const tx = new Transaction({
          userId: user._id,
          type: "interest",
          amount: savingsInterest,
          date: today,
        });
        await tx.save();
        user.savingsBalance += savingsInterest;
      }

      if (fdInterest > 0) {
        const tx = new Transaction({
          userId: user._id,
          type: "fdInterest",
          amount: fdInterest,
          date: today,
        });
        await tx.save();
        user.fd += fdInterest;
      }
      if (loanInterest > 0) {
        const tx = new Transaction({
          userId: user._id,
          type: "loanInterest",
          amount: loanInterest,
          date: today,
        });
        await tx.save();
        user.loanBalance += loanInterest;
      }

      // Update lastInterestCalc
      user.lastInterestCalc = today;
      await user.save();

    }

    return NextResponse.json({ success: true, results:[] });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}