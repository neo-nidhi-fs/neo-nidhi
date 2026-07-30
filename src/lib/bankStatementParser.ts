import * as XLSX from 'xlsx';
import type { ParsedTransaction } from '@/types/bankStatement';

// Matches DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY and YYYY-MM-DD
const DATE_RE = /\b(\d{4})[\/\-\.](\d{2})[\/\-\.](\d{2})\b|\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/;

function normalizeDate(raw: string): string | null {
  raw = raw.trim();
  // YYYY-MM-DD
  if (/^\d{4}/.test(raw)) {
    const [y, m, d] = raw.split(/[\/\-\.]/);
    if (!y || !m || !d) return null;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // DD/MM/YYYY or DD/MM/YY
  const parts = raw.split(/[\/\-\.]/);
  if (parts.length !== 3) return null;
  let [d, mo, y] = parts;
  if (y.length === 2) y = '20' + y;
  if (y.length !== 4) return null;
  const month = parseInt(mo, 10);
  const day = parseInt(d, 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function extractDate(line: string): { date: string; rest: string } | null {
  const match = line.match(DATE_RE);
  if (!match) return null;
  const date = normalizeDate(match[0]);
  if (!date) return null;
  const rest = line.slice(0, match.index) + line.slice((match.index ?? 0) + match[0].length);
  return { date, rest: rest.trim() };
}

function parseAmount(text: string): number {
  const cleaned = text.replace(/,/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function extractAmounts(text: string): number[] {
  return (text.match(/\b[\d,]+(?:\.\d{1,2})?\b/g) ?? [])
    .map(m => parseAmount(m))
    .filter(n => n > 0 && n < 100_000_000);
}

const CREDIT_WORDS = ['cr', 'credit', 'credited', 'deposit', 'deposited', 'received', 'refund', 'cashback', 'salary', 'income'];
const DEBIT_WORDS  = ['dr', 'debit', 'debited', 'withdrawal', 'withdrawn', 'spent', 'paid', 'payment', 'purchase', 'transfer out'];

function detectType(text: string): 'income' | 'expense' {
  const lower = text.toLowerCase();
  for (const w of CREDIT_WORDS) if (new RegExp(`\\b${w}\\b`, 'i').test(lower)) return 'income';
  for (const w of DEBIT_WORDS)  if (new RegExp(`\\b${w}\\b`, 'i').test(lower)) return 'expense';
  return 'expense';
}

function detectCategory(desc: string, type: 'income' | 'expense'): string {
  const l = desc.toLowerCase();
  if (l.includes('salary') || l.includes('payroll'))                   return 'Salary';
  if (l.includes('interest') && type === 'income')                     return 'Interest';
  if (l.includes('dividend'))                                           return 'Dividends';
  if (l.includes('upi'))                                                return type === 'income' ? 'UPI Credit' : 'UPI Payment';
  if (l.includes('grocery') || l.includes('supermark'))                return 'Groceries';
  if (l.includes('electricity') || l.includes('broadband') || l.includes('water bill') || l.includes('gas bill')) return 'Utilities';
  if (l.includes('restaurant') || l.includes('zomato') || l.includes('swiggy') || l.includes('dining') || l.includes('food')) return 'Dining';
  if (l.includes('amazon') || l.includes('flipkart') || l.includes('myntra') || l.includes('shopping')) return 'Shopping';
  if (l.includes('insurance') || l.includes(' lic '))                  return 'Insurance';
  if (l.includes('emi') || l.includes('loan repay') || l.includes('mortgage')) return 'EMI/Loan';
  if (l.includes('rent'))                                               return 'Rent';
  if (l.includes('petrol') || l.includes('fuel') || l.includes('uber') || l.includes('ola') || l.includes('transport')) return 'Transportation';
  if (l.includes('hospital') || l.includes('medical') || l.includes('pharmacy') || l.includes('doctor')) return 'Healthcare';
  if (l.includes('netflix') || l.includes('hotstar') || l.includes('spotify') || l.includes('entertainment')) return 'Entertainment';
  if (l.includes('refund'))                                             return type === 'income' ? 'Other Income' : 'Other Expense';
  if (l.includes('neft') || l.includes('rtgs') || l.includes('imps')) return type === 'income' ? 'Other Income' : 'Other Expense';
  return type === 'income' ? 'Other Income' : 'Other Expense';
}

function extractSource(desc: string): string {
  const upiMatch = desc.match(/UPI[-\/\s]([A-Za-z][A-Za-z0-9 ]{2,25})(?:[-\/\s]|$)/i);
  if (upiMatch) return upiMatch[1].trim();
  const toAtMatch = desc.match(/(?:\bto\b|\bat\b)\s+([A-Za-z][A-Za-z0-9 ]{2,30})/i);
  if (toAtMatch) return toAtMatch[1].trim();
  const words = desc.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(w => w.length > 2 && !/^\d+$/.test(w));
  return words.slice(0, 3).join(' ') || 'Bank Statement';
}

let _counter = 0;
function nextId(): string {
  return `stmt_${Date.now()}_${++_counter}`;
}

function rowsToTransactions(lines: string[]): ParsedTransaction[] {
  const results: ParsedTransaction[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 10) continue;
    const dateResult = extractDate(trimmed);
    if (!dateResult) continue;
    const amounts = extractAmounts(dateResult.rest);
    if (amounts.length === 0) continue;
    // Heuristic: balance is typically the largest number; use the smallest as transaction amount
    const amount = [...amounts].sort((a, b) => a - b)[0];
    if (amount <= 0) continue;
    const type = detectType(dateResult.rest);
    const desc = dateResult.rest.replace(/\b[\d,]+(?:\.\d{1,2})?\b/g, ' ').replace(/\s+/g, ' ').trim();
    results.push({
      tempId: nextId(),
      date: dateResult.date,
      description: desc.slice(0, 200),
      amount,
      type,
      category: detectCategory(desc, type),
      paymentSource: 'account',
      source: extractSource(desc),
    });
  }
  return results;
}

export async function parsePdf(buffer: Buffer, password?: string): Promise<ParsedTransaction[]> {
  // pdf-parse v2 ships as ESM; dynamic import avoids Next.js bundling issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfMod = await import('pdf-parse') as any;
  const pdfParse: (buf: Buffer, opts?: object) => Promise<{ text: string }> = pdfMod.default ?? pdfMod;
  const data = await pdfParse(buffer, password ? { password } : undefined);
  return rowsToTransactions(data.text.split('\n'));
}

export function parseCsv(text: string): ParsedTransaction[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  // Find the header row (first row containing 'date' and 'amount'/'debit'/'credit')
  let headerIdx = -1;
  let headers: string[] = [];
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const cols = splitCsvLine(lines[i]).map(c => c.toLowerCase().trim());
    if (cols.some(c => c.includes('date')) && cols.some(c => c.includes('amount') || c.includes('debit') || c.includes('credit') || c.includes('withdrawal'))) {
      headerIdx = i;
      headers = cols;
      break;
    }
  }
  if (headerIdx === -1) {
    // No header found — fall back to line-by-line date detection
    return rowsToTransactions(lines);
  }

  const dateCol   = headers.findIndex(h => h.includes('date') && !h.includes('value'));
  const amountCol = headers.findIndex(h => h === 'amount' || h === 'transaction amount');
  const debitCol  = headers.findIndex(h => h.includes('debit') || h.includes('withdrawal') || h.includes('dr'));
  const creditCol = headers.findIndex(h => (h.includes('credit') || h.includes('deposit')) && !h.includes('card'));
  const descCol   = headers.findIndex(h => h.includes('description') || h.includes('narration') || h.includes('particulars') || h.includes('details') || h.includes('remarks'));

  const results: ParsedTransaction[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length < 2) continue;

    const rawDate = dateCol >= 0 ? (cols[dateCol] ?? '') : '';
    if (!rawDate.trim()) continue;
    const dateResult = extractDate(rawDate.trim());
    if (!dateResult) continue;

    let amount = 0;
    let type: 'income' | 'expense' = 'expense';

    if (amountCol >= 0 && cols[amountCol]) {
      amount = parseAmount(cols[amountCol]);
      type = detectType(cols.join(' '));
    } else {
      const debit  = debitCol  >= 0 ? parseAmount(cols[debitCol]  ?? '') : 0;
      const credit = creditCol >= 0 ? parseAmount(cols[creditCol] ?? '') : 0;
      if (credit > 0)      { amount = credit; type = 'income'; }
      else if (debit > 0)  { amount = debit;  type = 'expense'; }
    }
    if (amount <= 0) continue;

    const desc = descCol >= 0 ? (cols[descCol] ?? '') : cols.slice(1, 4).join(' ');
    results.push({
      tempId: nextId(),
      date: dateResult.date,
      description: desc.slice(0, 200),
      amount,
      type,
      category: detectCategory(desc, type),
      paymentSource: 'account',
      source: extractSource(desc),
    });
  }
  return results;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if ((ch === ',' || ch === '\t') && !inQ) { result.push(cur.trim().replace(/^"|"$/g, '')); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur.trim().replace(/^"|"$/g, ''));
  return result;
}

export function parseExcel(buffer: Buffer): ParsedTransaction[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return [];
  return parseCsv(XLSX.utils.sheet_to_csv(sheet));
}
