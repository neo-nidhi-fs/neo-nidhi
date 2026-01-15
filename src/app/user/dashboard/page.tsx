"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  savingsBalance: number;
  loanBalance: number;
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    async function fetchUser() {
      try {
        // For demo: fetch first user. In real app, use auth session.
        const res = await fetch("/api/users");
        const data = await res.json();
        setUser(data.data[0]); 
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Error fetching user:", msg);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || (session?.user as { role?: string })?.role !== "user") {
    redirect("/login"); // only users allowed
  }


  if (!user) {
    return <p className="text-center mt-10">No user data found.</p>;
  }

  // Example savings goal
  const savingsGoal = 1000;
  const savingsProgress = Math.min((user.savingsBalance / savingsGoal) * 100, 100);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}!</h1>

      {/* Savings Section */}
      <div className="bg-green-100 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Savings</h2>
        <p className="text-2xl font-bold text-green-700">₹{user.savingsBalance}</p>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
          <div
            className="bg-green-500 h-4 rounded-full"
            style={{ width: `${savingsProgress}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Goal: ₹{savingsGoal} — {savingsProgress.toFixed(1)}% achieved 🎉
        </p>
      </div>

      {/* Loan Section */}
      <div className="bg-red-100 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Loans</h2>
        <p className="text-2xl font-bold text-red-700">₹{user.loanBalance}</p>
        {user.loanBalance > 0 ? (
          <p className="mt-2 text-sm text-gray-600">
            Keep repaying regularly to reduce your loan burden 💪
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">No loans outstanding 🎉</p>
        )}
      </div>

      {/* Motivational Message */}
      <div className="bg-blue-100 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Tip of the Day</h2>
        <p className="text-gray-700">
          Saving a little every day builds big rewards over time. Avoid loans unless truly necessary!
        </p>
      </div>
    </div>
  );
}