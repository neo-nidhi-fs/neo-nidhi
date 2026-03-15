/**
 * UsersSection Component
 * Responsibility: Display users table with actions
 */

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, Loader, Pencil } from 'lucide-react';
import { useState } from 'react';
import { User } from '@/lib/services/adminService';
import { AddUserDialog } from '../dialogs/AddUserDialog';
import { FdWithdrawDialog } from '../dialogs/FdWithdrawDialog';
import { InterestRateDialog } from '../dialogs/InterestRateDialog';
import { FdWithdrawInfo } from '@/lib/services/adminService';
import { formatDate, getDisplayAge } from '@/lib/helpers';
import { EditUserDobDialog } from '../dialogs/EditUserDobDialog';

type InterestRateUpdate = {
  saving?: number | null;
  fd?: number | null;
  loan?: number | null;
};

interface UsersTableColumn {
  header: string;
  accessor: string;
  type: 'string' | 'number' | 'currency' | 'action';
}

interface UsersSectionProps {
  users: User[];
  userDialogOpen: boolean;
  onUserDialogOpenChange: (open: boolean) => void;
  onAddUser: (
    name: string,
    dob: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  addUserLoading: boolean;
  onResetPassword: (
    userId: string,
    userName: string
  ) => Promise<{ success: boolean; message: string }>;
  resetPasswordLoading: string | null;
  onUpdateDob: (
    userId: string,
    dob: string | null
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  updateDobLoading: string | null;
  fdWithdrawInfo: FdWithdrawInfo;
  selectedUserForFd: User | null;
  onFdWithdrawDialogOpen: (open: boolean, user?: User) => void;
  fdWithdrawDialogOpen: boolean;
  onFdWithdrawInfoFetch: (userId: string) => void;
  onFdWithdraw: (
    amount: number
  ) => Promise<{ success: boolean; message: string }>;
  fdWithdrawLoading: boolean;
  interestRateDialogOpen: boolean;
  selectedUserForInterest: User | null;
  onInterestRateDialogOpen: (open: boolean, user?: User) => void;
  onUpdateInterestRates: (rates: InterestRateUpdate) => Promise<{
    success: boolean;
    message: string;
    data?: User['customInterestRates'];
  }>;
  interestRateLoading: boolean;
  onUserAdded?: () => void;
}

const ITEMS_PER_PAGE = 10;

const userTableColumns: UsersTableColumn[] = [
  { header: 'Name', accessor: 'name', type: 'string' },
  { header: 'DOB', accessor: 'dob', type: 'string' },
  { header: 'Age', accessor: 'age', type: 'number' },
  { header: 'Savings', accessor: 'savingsBalance', type: 'currency' },
  { header: 'SB Int', accessor: 'accruedSavingInterest', type: 'currency' },
  { header: 'FD', accessor: 'fd', type: 'currency' },
  { header: 'FD Int', accessor: 'accruedFdInterest', type: 'currency' },
  { header: 'Loans', accessor: 'loanBalance', type: 'currency' },
  { header: 'Loan Int', accessor: 'accruedLoanInterest', type: 'currency' },
  { header: 'Actions', accessor: 'actions', type: 'action' },
];

export function UsersSection({
  users,
  userDialogOpen,
  onUserDialogOpenChange,
  onAddUser,
  addUserLoading,
  onResetPassword,
  resetPasswordLoading,
  onUpdateDob,
  updateDobLoading,
  fdWithdrawInfo,
  selectedUserForFd,
  onFdWithdrawDialogOpen,
  fdWithdrawDialogOpen,
  onFdWithdrawInfoFetch,
  onFdWithdraw,
  fdWithdrawLoading,
  interestRateDialogOpen,
  selectedUserForInterest,
  onInterestRateDialogOpen,
  onUpdateInterestRates,
  interestRateLoading,
  onUserAdded,
}: UsersSectionProps) {
  const [userPage, setUserPage] = useState(1);
  const [dobDialogOpen, setDobDialogOpen] = useState(false);
  const [selectedUserForDob, setSelectedUserForDob] = useState<User | null>(
    null
  );
  const [dobDraft, setDobDraft] = useState('');

  const handleAddUser = async (name: string, dob: string, password: string) => {
    const result = await onAddUser(name, dob, password);
    if (result.success) {
      onUserDialogOpenChange(false);
      onUserAdded?.();
    }
  };

  const handleDobDialogOpen = (open: boolean, user?: User) => {
    setDobDialogOpen(open);
    if (open && user) {
      setSelectedUserForDob(user);
      setDobDraft(
        user.dob ? new Date(user.dob).toISOString().slice(0, 10) : ''
      );
    } else {
      setSelectedUserForDob(null);
      setDobDraft('');
    }
  };

  const handleUpdateDob = async (userId: string, dob: string | null) => {
    const result = await onUpdateDob(userId, dob);
    if (result.success) {
      setDobDialogOpen(false);
      onUserAdded?.();
    }
    return result;
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Registered Users</h2>
        <div className="flex items-center gap-2">
          <AddUserDialog
            open={userDialogOpen}
            onOpenChange={onUserDialogOpenChange}
            onSubmit={handleAddUser}
            loading={addUserLoading}
          />
          <EditUserDobDialog
            key={selectedUserForDob?._id ?? 'dob-dialog'}
            user={selectedUserForDob}
            open={dobDialogOpen}
            dob={dobDraft}
            onDobChange={setDobDraft}
            onOpenChange={(open) =>
              handleDobDialogOpen(open, selectedUserForDob ?? undefined)
            }
            onSubmit={handleUpdateDob}
            loading={updateDobLoading === selectedUserForDob?._id}
          />
        </div>
      </div>

      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                {userTableColumns.map((col) => (
                  <TableHead key={col.accessor}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users
                .slice(
                  (userPage - 1) * ITEMS_PER_PAGE,
                  userPage * ITEMS_PER_PAGE
                )
                .map((u) => (
                  <TableRow key={u._id}>
                    {userTableColumns.map((col) => (
                      <TableCell key={col.accessor} className="text-green-200">
                        {col.type === 'action' ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => onResetPassword(u._id, u.name)}
                              disabled={resetPasswordLoading === u._id}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {resetPasswordLoading === u._id ? (
                                <Loader size={14} className="animate-spin" />
                              ) : (
                                <RotateCcw size={16} />
                              )}
                            </Button>
                            <Button
                              onClick={() => handleDobDialogOpen(true, u)}
                              disabled={updateDobLoading === u._id}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updateDobLoading === u._id ? (
                                <Loader size={14} className="animate-spin" />
                              ) : (
                                <Pencil size={16} />
                              )}
                            </Button>
                            <FdWithdrawDialog
                              user={u}
                              open={
                                fdWithdrawDialogOpen &&
                                selectedUserForFd?._id === u._id
                              }
                              onOpenChange={(open) =>
                                onFdWithdrawDialogOpen(
                                  open,
                                  open ? u : undefined
                                )
                              }
                              fdWithdrawInfo={fdWithdrawInfo}
                              onFetchFdInfo={onFdWithdrawInfoFetch}
                              onSubmit={onFdWithdraw}
                              loading={fdWithdrawLoading}
                            />
                            <InterestRateDialog
                              user={u}
                              open={
                                interestRateDialogOpen &&
                                selectedUserForInterest?._id === u._id
                              }
                              onOpenChange={(open) =>
                                onInterestRateDialogOpen(
                                  open,
                                  open ? u : undefined
                                )
                              }
                              onSubmit={onUpdateInterestRates}
                              loading={interestRateLoading}
                            />
                          </div>
                        ) : col.type === 'currency' ? (
                          `₹${((u[col.accessor as keyof User] as number) || 0).toFixed(2)}`
                        ) : col.accessor === 'age' ? (
                          getDisplayAge(u.dob, u.age)
                        ) : col.accessor === 'dob' ? (
                          u.dob ? (
                            formatDate(u.dob)
                          ) : (
                            '-'
                          )
                        ) : (
                          String(u[col.accessor as keyof User] || '')
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {users.length > ITEMS_PER_PAGE && (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-400">
                Showing {(userPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(userPage * ITEMS_PER_PAGE, users.length)} of{' '}
                {users.length} users
              </p>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
                <Button
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  disabled={userPage === 1}
                  className="bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </Button>
                <div className="hidden sm:flex items-center gap-2">
                  {Array.from({
                    length: Math.ceil(users.length / ITEMS_PER_PAGE),
                  }).map((_, i) => (
                    <Button
                      key={i + 1}
                      onClick={() => setUserPage(i + 1)}
                      className={`w-10 h-10 text-sm ${
                        userPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <div className="sm:hidden text-sm text-gray-400">
                  Page {userPage}
                </div>
                <Button
                  onClick={() =>
                    setUserPage((p) =>
                      Math.min(Math.ceil(users.length / ITEMS_PER_PAGE), p + 1)
                    )
                  }
                  disabled={
                    userPage === Math.ceil(users.length / ITEMS_PER_PAGE)
                  }
                  className="bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
