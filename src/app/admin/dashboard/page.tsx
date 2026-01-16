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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface User {
  _id: string;
  name: string;
  age: number;
  savingsBalance: number;
  loanBalance: number;
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
      const res = await fetch("/api/schemes");
      const data = await res.json();
      setSchemes(data.data);
    }
    fetchSchemes();
  }, []);

  async function handleAddScheme(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString();
    const interestRate = Number(formData.get("interestRate"));

    const res = await fetch("/api/schemes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, interestRate }),
    });

    const data = await res.json();
    if (res.ok) {
      setSchemes((prev) => [...prev, data.data]);
      e.currentTarget.reset();
    } else {
      alert(`Error: ${data.error}`);
    }
  }

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data.data);
      } catch (err) {
        console.error("Error fetching users:", err);
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
    const name = formData.get("name") as string;
    const age = Number(formData.get("age"));
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age, password, role: "user" }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, data.data]);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Something went wrong.");
    }
  }

  if (loading) {
    return <p className="text-center mt-10">Loading dashboard...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Add User Button + Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-6">➕ Add New User</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Kid</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full cursor-pointer">Register</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Users Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Age</th>
              <th className="border p-2">Savings</th>
              <th className="border p-2">Loans</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="border p-2">{u.name}</td>
                <td className="border p-2">{u.age}</td>
                <td className="border p-2">₹{u.savingsBalance}</td>
                <td className="border p-2">₹{u.loanBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {/* Add Scheme Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="m-6">➕ Add New Scheme</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Scheme</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddScheme} className="space-y-4">
            <div>
              <Label htmlFor="name">Scheme Name</Label>
              <Input id="name" name="name" placeholder="Normal Deposit / FD / RD" required />
            </div>
            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input id="interestRate" name="interestRate" type="number" step="0.1" required />
            </div>
            <Button type="submit" className="w-full">Add Scheme</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schemes List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Schemes</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">Interest Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {schemes.map((s: Scheme) => (
                <tr key={s._id}>
                  <td className="border p-2">{s.name}</td>
                  <td className="border p-2">{s.interestRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}