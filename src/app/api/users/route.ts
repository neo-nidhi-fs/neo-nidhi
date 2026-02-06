import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({});
    return NextResponse.json({ success: true, data: users });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // Create new user (password will be hashed automatically by pre-save hook in User model)
    const newUser = new User({
      name: body.name?.trim(),
      age: body.age,
      role: body.role || 'user', // default to user
      savingsBalance: body.savingsBalance || 0,
      loanBalance: 0,
      password: body.password, // raw password, will be hashed
    });

    await newUser.save();

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
