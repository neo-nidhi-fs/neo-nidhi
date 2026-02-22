'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Plus,
  Settings,
  RotateCcw,
  Loader,
  Edit,
  Trash2,
  BarChart3,
  Banknote,
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  age: number;
  savingsBalance: number;
  loanBalance: number;
  fd?: number;
}

interface Scheme {
  _id: string;
  name: string;
  interestRate: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [message, setMessage] = useState('');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addSchemeLoading, setAddSchemeLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState<
    string | null
  >(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [schemeDialogOpen, setSchemeDialogOpen] = useState(false);
  const [fdWithdrawDialogOpen, setFdWithdrawDialogOpen] = useState(false);
  const [selectedUserForFd, setSelectedUserForFd] = useState<User | null>(null);
  const [fdWithdrawLoading, setFdWithdrawLoading] = useState(false);
  const [fdWithdrawInfo, setFdWithdrawInfo] = useState({
    matureAmount: 0,
    prematureAmount: 0,
    totalFd: 0,
    matureTransactions: [] as {
      amount: number;
      date: Date;
      yearsOld: number;
    }[],
    prematureTransactions: [] as {
      amount: number;
      date: Date;
      yearsOld: number;
    }[],
  });
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [editSchemeLoading, setEditSchemeLoading] = useState(false);
  const [deleteSchemeLoading, setDeleteSchemeLoading] = useState<string | null>(
    null
  );
  const [userPage, setUserPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchSchemes() {
      const res = await fetch('/api/schemes');
      const data = await res.json();
      setSchemes(data.data);
    }
    fetchSchemes();
  }, []);

  async function handleAddScheme(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddSchemeLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString();
    const interestRate = Number(formData.get('interestRate'));

    try {
      const res = await fetch('/api/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, interestRate }),
      });

      const data = await res.json();
      if (res.ok) {
        setSchemes((prev) => [...prev, data.data]);
        setMessage('✅ Scheme added successfully');

        setTimeout(() => setSchemeDialogOpen(false), 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setAddSchemeLoading(false);
    }
  }

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Handle new user creation
  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddUserLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const age = Number(formData.get('age'));
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age, password, role: 'user' }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, data.data]);
        setMessage('✅ User registered successfully');

        setTimeout(() => setUserDialogOpen(false), 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch {
      setMessage('❌ Something went wrong.');
    } finally {
      setAddUserLoading(false);
    }
  }

  async function handleResetPassword(userId: string, userName: string) {
    if (!confirm(`Reset password for ${userName} to default (123)?`)) {
      return;
    }

    setResetPasswordLoading(userId);
    try {
      const res = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Password reset to default for ${userName}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setResetPasswordLoading(null);
    }
  }

  async function fetchFdWithdrawInfo(userId: string) {
    try {
      const res = await fetch(`/api/transactions/withdraw-fd?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setFdWithdrawInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching FD info:', error);
    }
  }

  async function handleAdminWithdrawFd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUserForFd) return;

    setFdWithdrawLoading(true);
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('withdrawAmount'));

    try {
      const res = await fetch('/api/transactions/withdraw-fd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForFd._id,
          amount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(
          `✅ FD withdrawal successful for ${selectedUserForFd.name}: ${data.message}`
        );
        // Refresh users data
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        setUsers(usersData.data);

        setTimeout(() => setFdWithdrawDialogOpen(false), 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setFdWithdrawLoading(false);
    }
  }

  async function handleEditScheme(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingScheme) return;

    setEditSchemeLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString();
    const interestRate = Number(formData.get('interestRate'));

    try {
      const res = await fetch(`/api/schemes/${editingScheme._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, interestRate }),
      });

      const data = await res.json();
      if (res.ok) {
        setSchemes((prev) =>
          prev.map((s) => (s._id === editingScheme._id ? data.data : s))
        );
        setMessage('✅ Scheme updated successfully');
        setEditingScheme(null);
        setTimeout(() => setSchemeDialogOpen(false), 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setEditSchemeLoading(false);
    }
  }

  async function handleDeleteScheme(schemeId: string, schemeName: string) {
    if (!confirm(`Delete scheme "${schemeName}"?`)) {
      return;
    }

    setDeleteSchemeLoading(schemeId);
    try {
      const res = await fetch(`/api/schemes/${schemeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (res.ok) {
        setSchemes((prev) => prev.filter((s) => s._id !== schemeId));
        setMessage('✅ Scheme deleted successfully');
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setDeleteSchemeLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Loading dashboard...</p>
      </div>
    );
  }

  const userTableColumns = [
    { header: 'Name', accessor: 'name', type: 'string' },
    { header: 'Age', accessor: 'age', type: 'number' },
    { header: 'Savings', accessor: 'savingsBalance', type: 'currency' },
    {
      header: 'Savings Interest',
      accessor: 'accruedSavingInterest',
      type: 'currency',
    },
    { header: 'Fixed Deposit', accessor: 'fd', type: 'currency' },
    {
      header: 'Fixed Deposit Interest',
      accessor: 'accruedFdInterest',
      type: 'currency',
    },
    { header: 'Loans', accessor: 'loanBalance', type: 'currency' },
    {
      header: 'Loan Interest',
      accessor: 'accruedLoanInterest',
      type: 'currency',
    },
    { header: 'Actions', accessor: 'actions', type: 'action' },
  ];

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-gray-200 text-lg mb-4">
            Manage users, schemes, and platform settings
          </p>
          <div className="flex gap-4">
            <Link href="/admin/reports">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                <BarChart3 size={18} />
                View Reports
              </Button>
            </Link>
          </div>
          {message && <p className="mt-4 text-sm">{message}</p>}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-400/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-400">
                  Total Users
                </CardTitle>
                <Users className="text-blue-400" size={24} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{users.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-400/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-purple-400">
                  Active Schemes
                </CardTitle>
                <Settings className="text-purple-400" size={24} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{schemes.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Registered Users</h2>
            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold flex items-center gap-2">
                  <Plus size={18} />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Register New User
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-100">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      disabled={addUserLoading}
                      className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age" className="text-gray-100">
                      Age
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      required
                      disabled={addUserLoading}
                      className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-gray-100">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      disabled={addUserLoading}
                      className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={addUserLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addUserLoading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Register'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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
                          <TableCell
                            key={col.accessor}
                            className="text-green-200"
                          >
                            {col.type === 'action' ? (
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  onClick={() =>
                                    handleResetPassword(u._id, u.name)
                                  }
                                  disabled={resetPasswordLoading === u._id}
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {resetPasswordLoading === u._id ? (
                                    <Loader
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <RotateCcw size={16} />
                                  )}
                                </Button>
                                {u.fd && u.fd > 0 && (
                                  <Dialog
                                    open={
                                      fdWithdrawDialogOpen &&
                                      selectedUserForFd?._id === u._id
                                    }
                                    onOpenChange={(open) => {
                                      setFdWithdrawDialogOpen(open);
                                      if (open) {
                                        setSelectedUserForFd(u);
                                        fetchFdWithdrawInfo(u._id);
                                      } else {
                                        setSelectedUserForFd(null);
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                                      >
                                        <Banknote size={16} />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
                                      <DialogHeader>
                                        <DialogTitle className="text-white">
                                          Withdraw FD for {u.name}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-3 mb-4">
                                        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                                          <p className="text-sm text-gray-300">
                                            Mature Amount (3+ years):
                                          </p>
                                          <p className="text-2xl font-bold text-green-400">
                                            ₹
                                            {fdWithdrawInfo.matureAmount.toFixed(
                                              2
                                            )}
                                          </p>
                                          {fdWithdrawInfo.matureTransactions
                                            .length > 0 && (
                                            <p className="text-xs text-gray-400 mt-2">
                                              {
                                                fdWithdrawInfo
                                                  .matureTransactions.length
                                              }{' '}
                                              transaction(s) ready to withdraw
                                            </p>
                                          )}
                                        </div>

                                        <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-3">
                                          <p className="text-sm text-gray-300">
                                            Premature Amount (under 3 years):
                                          </p>
                                          <p className="text-2xl font-bold text-orange-400">
                                            ₹
                                            {fdWithdrawInfo.prematureAmount.toFixed(
                                              2
                                            )}
                                          </p>
                                          {fdWithdrawInfo.prematureTransactions
                                            .length > 0 && (
                                            <p className="text-xs text-gray-400 mt-1">
                                              ⚠️ Lower interest rate applies
                                            </p>
                                          )}
                                        </div>

                                        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                                          <p className="text-sm text-gray-300">
                                            Total FD Balance:
                                          </p>
                                          <p className="text-xl font-bold text-blue-400">
                                            ₹{fdWithdrawInfo.totalFd.toFixed(2)}
                                          </p>
                                        </div>
                                      </div>

                                      <form
                                        onSubmit={handleAdminWithdrawFd}
                                        className="space-y-4"
                                      >
                                        <div>
                                          <Label
                                            htmlFor={`admin-withdraw-${u._id}`}
                                            className="text-gray-100"
                                          >
                                            Amount to Withdraw (₹)
                                          </Label>
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={fdWithdrawInfo.totalFd}
                                            placeholder="0.00"
                                            name="withdrawAmount"
                                            id={`admin-withdraw-${u._id}`}
                                            required
                                            disabled={fdWithdrawLoading}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded disabled:opacity-50"
                                          />
                                        </div>

                                        <div className="text-xs text-gray-400 space-y-1">
                                          <p>
                                            💡 Mature amount is priority.
                                            Interest will be calculated
                                            accordingly.
                                          </p>
                                          <p>
                                            • Full interest rate applies to
                                            mature FD
                                          </p>
                                          <p>
                                            • Reduced interest rate applies to
                                            premature withdrawal
                                          </p>
                                        </div>

                                        <Button
                                          type="submit"
                                          disabled={
                                            fdWithdrawLoading ||
                                            fdWithdrawInfo.totalFd === 0
                                          }
                                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                          {fdWithdrawLoading ? (
                                            <>
                                              <Loader
                                                size={18}
                                                className="animate-spin"
                                              />
                                              Processing...
                                            </>
                                          ) : (
                                            'Withdraw FD'
                                          )}
                                        </Button>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            ) : col.type === 'currency' ||
                              col.accessor === 'loanBalance' ? (
                              `₹${((u[col.accessor as keyof User] as number) || 0).toFixed(2)}`
                            ) : (
                              u[col.accessor as keyof User]
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
                          Math.min(
                            Math.ceil(users.length / ITEMS_PER_PAGE),
                            p + 1
                          )
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

        {/* Schemes Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Available Schemes</h2>
            <Dialog
              open={schemeDialogOpen}
              onOpenChange={(open) => {
                setSchemeDialogOpen(open);
                if (!open) setEditingScheme(null);
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2">
                  <Plus size={18} />
                  Add New Scheme
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingScheme ? 'Edit Scheme' : 'Create New Scheme'}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={editingScheme ? handleEditScheme : handleAddScheme}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="name" className="text-gray-100">
                      Scheme Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Normal Deposit / FD / RD"
                      defaultValue={editingScheme?.name || ''}
                      required
                      disabled={addSchemeLoading || editSchemeLoading}
                      className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="interestRate" className="text-gray-100">
                      Interest Rate (%)
                    </Label>
                    <Input
                      id="interestRate"
                      name="interestRate"
                      type="number"
                      step="0.1"
                      defaultValue={editingScheme?.interestRate || ''}
                      required
                      disabled={addSchemeLoading || editSchemeLoading}
                      className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={addSchemeLoading || editSchemeLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addSchemeLoading || editSchemeLoading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        {editingScheme ? 'Updating...' : 'Adding...'}
                      </>
                    ) : editingScheme ? (
                      'Update Scheme'
                    ) : (
                      'Add Scheme'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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
                            setEditingScheme(s);
                            setSchemeDialogOpen(true);
                          }}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteScheme(s._id, s.name)}
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

          {message && (
            <div
              className={`mt-6 p-3 rounded-lg text-sm ${
                message.includes('Error') || message.includes('❌')
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-green-500/10 border border-green-500/30 text-green-400'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
