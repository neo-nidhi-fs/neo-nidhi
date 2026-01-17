'use client';

import { useEffect, useState } from 'react';
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
import { Users, Plus, Settings } from 'lucide-react';

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
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString();
    const interestRate = Number(formData.get('interestRate'));

    const res = await fetch('/api/schemes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, interestRate }),
    });

    const data = await res.json();
    if (res.ok) {
      setSchemes((prev) => [...prev, data.data]);
    } else {
      alert(`Error: ${data.error}`);
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
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Something went wrong.');
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
    { header: 'Fixed Deposit', accessor: 'fd', type: 'currency' },
    { header: 'Loans', accessor: 'loanBalance', type: 'currency' },
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
          <p className="text-gray-200 text-lg">
            Manage users, schemes, and platform settings
          </p>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold flex items-center gap-2">
                  <Plus size={18} />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
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
                      className="bg-slate-700 border-slate-600 text-white"
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
                      className="bg-slate-700 border-slate-600 text-white"
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
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold"
                  >
                    Register
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
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      {userTableColumns.map((col) => (
                        <TableCell
                          key={col.accessor}
                          className="text-green-200"
                        >
                          {col.type === 'currency' ||
                          col.accessor === 'loanBalance'
                            ? `₹${(u[col.accessor as keyof User] || 0).toLocaleString()}`
                            : u[col.accessor as keyof User]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Schemes Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Available Schemes</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2">
                  <Plus size={18} />
                  Add New Scheme
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Create New Scheme
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddScheme} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-100">
                      Scheme Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Normal Deposit / FD / RD"
                      required
                      className="bg-slate-700 border-slate-600 text-white"
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
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
                  >
                    Add Scheme
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
                    <h3 className="text-lg font-bold text-purple-200 mb-2">
                      {s.name}
                    </h3>
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
      </div>
    </main>
  );
}
