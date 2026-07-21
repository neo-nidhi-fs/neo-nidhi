'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { IRDScheme, ICreateSchemeRequest } from '@/lib/services/rdNewService';
import { useRDSchemes } from '@/hooks/useRDSchemes';
import RDSchemeDialog from './dialogs/RDSchemeDialog';

export default function RDSchemesSection() {
  const { schemes, loading, error, fetchSchemes, createScheme, updateScheme, deleteScheme } =
    useRDSchemes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IRDScheme | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(scheme: IRDScheme) {
    setEditing(scheme);
    setDialogOpen(true);
  }

  async function handleSave(data: ICreateSchemeRequest): Promise<boolean> {
    if (editing) {
      return updateScheme(editing._id, data);
    }
    return createScheme(data);
  }

  async function handleDelete(scheme: IRDScheme) {
    setDeleteError('');
    if (!confirm(`Delete scheme "${scheme.name}"? This cannot be undone.`)) return;
    const ok = await deleteScheme(scheme._id);
    if (!ok) setDeleteError('Cannot delete: there may be active subscriptions.');
  }

  return (
    <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-cyan-400">RD Schemes</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Scheme
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      {deleteError && <p className="text-red-400 text-sm mb-3">{deleteError}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : schemes.length === 0 ? (
        <p className="text-gray-400 text-sm">No RD schemes yet. Create one to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b border-slate-700">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Rate (% p.a.)</th>
                <th className="pb-2 pr-4">Tenure</th>
                <th className="pb-2 pr-4">Min / Max Monthly</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schemes.map((s) => (
                <tr key={s._id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-2 pr-4 text-white font-medium">
                    {s.name}
                    {s.description && (
                      <span className="block text-xs text-gray-400">{s.description}</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-green-400">{s.interestRate}%</td>
                  <td className="py-2 pr-4 text-gray-300">{s.tenureMonths} mo</td>
                  <td className="py-2 pr-4 text-gray-300">
                    ₹{s.minMonthlyAmount}
                    {s.maxMonthlyAmount != null ? ` / ₹${s.maxMonthlyAmount}` : ' / —'}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RDSchemeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </section>
  );
}
