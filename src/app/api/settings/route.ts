import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Settings } from "@/models/Settings";

// GET: Fetch current interest rates
export async function GET() {
  try {
    await dbConnect();
    const settings = await Settings.findOne({});
    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST: Update interest rates
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings(body);
    } else {
      settings.savingsInterestRate = body.savingsInterestRate;
      settings.loanInterestRate = body.loanInterestRate;
    }

    await settings.save();

    return NextResponse.json({ success: true, data: settings }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}