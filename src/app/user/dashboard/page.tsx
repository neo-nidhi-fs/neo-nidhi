"use client";

import { useEffect, useState } from "react";

export default function UserDashboard() {
  const [user, setUser] = useState({name:'', savingsBalance: 0, loanBalance: 0});
  const [loading, setLoading] = useState(true);

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
        <p className="text-lg">📉 Loan Balance: ₹{user.loanBalance}</p>
      </div>
    </div>
  );
}