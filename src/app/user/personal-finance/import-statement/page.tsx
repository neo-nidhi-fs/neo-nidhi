'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Check, Loader, AlertCircle, FileText } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/financeCategories';
import type { ParsedTransaction } from '@/types/bankStatement';

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as string[];

export default function ImportStatementPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setError('');
  };

  const handleParse = async () => {
    if (!file) { setError('Please select a file.'); return; }
    setParsing(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (password) fd.append('password', password);
      const res = await fetch('/api/user/finance/parse-statement', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error ?? 'Failed to parse statement.'); return; }
      if (data.transactions.length === 0) {
        setError('No transactions found in the file. The format may not be supported or the file may be empty.');
        return;
      }
      setTransactions(data.transactions);
      setSelectedIds(new Set(data.transactions.map((t: ParsedTransaction) => t.tempId)));
      setStep('review');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setParsing(false);
    }
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(transactions.map(t => t.tempId)) : new Set());
  };

  const toggleOne = (tempId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(tempId) ? next.delete(tempId) : next.add(tempId);
      return next;
    });
  };

  const updateTransaction = (tempId: string, patch: Partial<ParsedTransaction>) => {
    setTransactions(prev => prev.map(t => t.tempId === tempId ? { ...t, ...patch } : t));
  };

  const handleImport = async () => {
    const toImport = transactions.filter(t => selectedIds.has(t.tempId));
    if (toImport.length === 0) { setError('Select at least one transaction to import.'); return; }
    setImporting(true);
    setError('');
    try {
      const res = await fetch('/api/user/finance/bulk-add-cashflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: toImport }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error ?? 'Import failed.'); return; }
      setImportResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  if (importResult) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Import Complete</h2>
          <p className="text-gray-300 mb-1">{importResult.imported} transaction{importResult.imported !== 1 ? 's' : ''} imported</p>
          {importResult.skipped > 0 && (
            <p className="text-gray-400 text-sm mb-4">{importResult.skipped} duplicate{importResult.skipped !== 1 ? 's' : ''} skipped</p>
          )}
          <button
            onClick={() => router.push('/user/personal-finance/manage')}
            className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Transactions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-slate-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => step === 'review' ? setStep('upload') : router.back()}
          className="text-gray-300 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">
          {step === 'upload' ? 'Import Bank Statement' : `Review Transactions (${transactions.length})`}
        </h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Step 1: Upload ── */}
        {step === 'upload' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Upload your bank statement</p>
                <p className="text-xs text-gray-400">PDF, CSV, XLS, or XLSX · Max 10 MB</p>
              </div>
            </div>

            {/* File picker */}
            <div
              className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg p-8 text-center cursor-pointer transition-colors mb-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={28} className="mx-auto mb-2 text-gray-400" />
              {file ? (
                <p className="text-sm text-blue-300 font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-300 mb-1">Click to select file</p>
                  <p className="text-xs text-gray-500">or drag and drop</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.csv,.xls,.xlsx"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Password field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                PDF Password <span className="text-gray-500 font-normal">(leave blank if not protected)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password if required"
                autoComplete="off"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <button
              onClick={handleParse}
              disabled={!file || parsing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {parsing ? <><Loader size={16} className="animate-spin" /> Parsing…</> : <><Upload size={16} /> Parse Statement</>}
            </button>
          </div>
        )}

        {/* ── Step 2: Review ── */}
        {step === 'review' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === transactions.length && transactions.length > 0}
                    onChange={e => toggleAll(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  Select all
                </label>
                <span className="text-xs text-gray-500">{selectedIds.size} of {transactions.length} selected</span>
              </div>
              <button
                onClick={handleImport}
                disabled={selectedIds.size === 0 || importing}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
              >
                {importing ? <><Loader size={14} className="animate-spin" /> Importing…</> : <><Check size={14} /> Import {selectedIds.size} Selected</>}
              </button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/50">
                      <th className="w-8 px-3 py-3"></th>
                      <th className="px-3 py-3 text-left text-gray-400 font-medium">Date</th>
                      <th className="px-3 py-3 text-left text-gray-400 font-medium">Description</th>
                      <th className="px-3 py-3 text-left text-gray-400 font-medium">Type</th>
                      <th className="px-3 py-3 text-left text-gray-400 font-medium">Category</th>
                      <th className="px-3 py-3 text-right text-gray-400 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, idx) => (
                      <tr
                        key={t.tempId}
                        className={`border-b border-slate-700/50 transition-colors ${selectedIds.has(t.tempId) ? 'bg-slate-700/20' : 'opacity-40'} ${idx % 2 === 0 ? '' : 'bg-slate-800/30'}`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(t.tempId)}
                            onChange={() => toggleOne(t.tempId)}
                            className="w-4 h-4 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-gray-300 whitespace-nowrap">{t.date}</td>
                        <td className="px-3 py-2 text-gray-300 max-w-xs truncate" title={t.description}>{t.description}</td>
                        <td className="px-3 py-2">
                          <select
                            value={t.type}
                            onChange={e => updateTransaction(t.tempId, {
                              type: e.target.value as 'income' | 'expense',
                              category: '',
                            })}
                            className="bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={t.category}
                            onChange={e => updateTransaction(t.tempId, { category: e.target.value })}
                            className="bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-35"
                          >
                            {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={t.amount}
                            onChange={e => updateTransaction(t.tempId, { amount: parseFloat(e.target.value) || 0 })}
                            className="bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-xs text-white text-right w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sticky import button for long lists */}
            {transactions.length > 10 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleImport}
                  disabled={selectedIds.size === 0 || importing}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
                >
                  {importing ? <><Loader size={14} className="animate-spin" /> Importing…</> : <><Check size={14} /> Import {selectedIds.size} Selected</>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
