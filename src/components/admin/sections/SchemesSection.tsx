/**
 * SchemesSection Component
 * Responsibility: Display schemes management interface
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader } from 'lucide-react';
import { Scheme } from '@/lib/services/adminService';
import { AddSchemeDialog } from '../dialogs/AddSchemeDialog';

interface SchemesSectionProps {
  schemes: Scheme[];
  schemeDialogOpen: boolean;
  onSchemeDialogOpenChange: (open: boolean) => void;
  editingScheme: Scheme | null;
  onEditingSchemeChange: (scheme: Scheme | null) => void;
  onAddScheme: (
    name: string,
    interestRate: number
  ) => Promise<{ success: boolean; message: string }>;
  onEditScheme: (
    schemeId: string,
    name: string,
    interestRate: number
  ) => Promise<{ success: boolean; message: string }>;
  addSchemeLoading: boolean;
  editSchemeLoading: boolean;
  onDeleteScheme: (
    schemeId: string
  ) => Promise<{ success: boolean; message: string }>;
  deleteSchemeLoading: string | null;
}

export function SchemesSection({
  schemes,
  schemeDialogOpen,
  onSchemeDialogOpenChange,
  editingScheme,
  onEditingSchemeChange,
  onAddScheme,
  onEditScheme,
  addSchemeLoading,
  editSchemeLoading,
  onDeleteScheme,
  deleteSchemeLoading,
}: SchemesSectionProps) {
  const handleSubmit = async (name: string, interestRate: number) => {
    if (editingScheme) {
      const result = await onEditScheme(editingScheme._id, name, interestRate);
      if (result.success) {
        onEditingSchemeChange(null);
        onSchemeDialogOpenChange(false);
      }
    } else {
      const result = await onAddScheme(name, interestRate);
      if (result.success) {
        onSchemeDialogOpenChange(false);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Available Schemes</h2>
        <AddSchemeDialog
          open={schemeDialogOpen}
          onOpenChange={onSchemeDialogOpenChange}
          onSubmit={handleSubmit}
          loading={addSchemeLoading || editSchemeLoading}
          editingScheme={editingScheme}
          onEditingSchemeChange={onEditingSchemeChange}
        />
      </div>

      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemes.map((s: Scheme) => (
              <div
                key={s._id}
                className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-400/30 rounded-lg p-4 hover:border-purple-400/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-purple-200">
                    {s.name}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        onEditingSchemeChange(s);
                        onSchemeDialogOpenChange(true);
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      onClick={() => onDeleteScheme(s._id)}
                      disabled={deleteSchemeLoading === s._id}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteSchemeLoading === s._id ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-gray-100">
                  Interest Rate:{' '}
                  <span className="text-2xl font-bold text-purple-300">
                    {s.interestRate}%
                  </span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
