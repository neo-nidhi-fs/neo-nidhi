"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export default function UserDashboard() {
  const [user, setUser] = useState({name:'', savingsBalance: 0, loanBalance: 0, _id:'',fd:0});
  console.log("user ==> ", user);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get("oldPassword")?.toString();
    const newPassword = formData.get("newPassword")?.toString();

    const res = await fetch(`/api/users/${user?._id}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Password updated successfully");
      e.currentTarget.reset();
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  }


  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/session");
      const session = await res.json();

      if (session?.user?.id) {
        const userRes = await fetch(`/api/users/${session.user.id}`);
        const userData = await userRes.json();
        setUser(userData.data);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (!user) return <p className="text-center mt-10">User not found</p>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user.name} 👋</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <p className="text-lg">💰 Savings Balance: ₹{user.savingsBalance}</p>
        <p className="text-lg">💰 Fixed Deposit: ₹{user.fd}</p>
        <p className="text-lg">📉 Loan Balance: ₹{user.loanBalance}</p>
      </div>
       {/* Change Password Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>🔑 Change Password</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Your Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword">Old Password</Label>
              <Input id="oldPassword" name="oldPassword" type="password" required />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required />
            </div>
            <Button type="submit" className="w-full">Update Password</Button>
          </form>
          {message && <p className="mt-4 text-sm">{message}</p>}
        </DialogContent>
      </Dialog>

    </div>
  );
}