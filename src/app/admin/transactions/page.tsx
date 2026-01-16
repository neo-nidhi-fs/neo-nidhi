"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface User {
  _id: string;
  name: string;
  age: number;
  savingsBalance: number;
  loanBalance: number;
}

interface Transaction {
  _id: string;
  userId: string;
  type: "deposit" | "loan" | "repayment";
  amount: number;
  date: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      setUsers(usersData.data);

      const txRes = await fetch("/api/transactions");
      const txData = await txRes.json();
      setTransactions(txData.data);

      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleAddTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = formData.get("userId") as string;
    const type = formData.get("type") as string;
    const amount = Number(formData.get("amount"));

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, type, amount }),
    });

    const data = await res.json();
    if (res.ok) {
      setTransactions((prev) => [...prev, data.data]);
      e.currentTarget.reset();
    } else {
      alert(`Error: ${data.error}`);
    }
  }

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  const transactionTypes = [
    { value: "deposit", label: "Deposit" },
    {value: 'fd', label: 'Fixed Deposit'},
    { value: "loan", label: "Loan" },
    { value: "repayment", label: "Repayment" },
    { value: "withdrawal", label: "Withdrawal" },
  ]

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Add Transaction Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>➕ Add Transaction</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            {/* Select User */}
            <div>
              <Label>User</Label>
              <select
                name="userId"
                className="w-full border rounded px-3 py-2"
                required
              >
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction Type */}
            <div>
              <Label>Type</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {
                    transactionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label>Amount</Label>
              <Input name="amount" type="number" required />
            </div>

            <Button type="submit" className="w-full">Add Transaction</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transactions Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">All Transactions</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">User</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const user = users.find((u) => u._id === tx.userId);
              return (
                <tr key={tx._id}>
                  <td className="border p-2">{user?.name || "Unknown"}</td>
                  <td className="border p-2 capitalize">{tx.type}</td>
                  <td className="border p-2">₹{tx.amount}</td>
                  <td className="border p-2">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}