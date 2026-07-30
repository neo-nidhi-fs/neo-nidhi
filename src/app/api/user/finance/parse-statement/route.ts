import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import { parsePdf, parseCsv, parseExcel } from '@/lib/bankStatementParser';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    const featureFlagError = enforceFinanceFeatureEnabled(user);
    if (featureFlagError) return featureFlagError;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const password = (formData.get('password') as string | null) ?? '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const maxBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxBytes) {
      return NextResponse.json({ success: false, error: 'File too large (max 10 MB)' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name.toLowerCase();

    let transactions;
    if (filename.endsWith('.pdf')) {
      transactions = await parsePdf(buffer, password || undefined);
    } else if (filename.endsWith('.csv')) {
      transactions = parseCsv(buffer.toString('utf-8'));
    } else if (filename.endsWith('.xls') || filename.endsWith('.xlsx')) {
      transactions = parseExcel(buffer);
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported file format. Use PDF, CSV, XLS, or XLSX.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      transactions,
      warning: transactions.length === 0 ? 'no_transactions_found' : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse statement';
    // Wrong password produces a specific pdfjs error
    const isPasswordError = message.toLowerCase().includes('password') || message.toLowerCase().includes('incorrect');
    return NextResponse.json(
      { success: false, error: isPasswordError ? 'Incorrect PDF password' : message },
      { status: 500 }
    );
  }
}
