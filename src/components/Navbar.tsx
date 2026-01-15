"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center shadow">
      {/* App Logo */}
      <Link href="/" className="text-2xl font-bold hover:text-yellow-300">
        neoNidhi
      </Link>

      {/* Navigation Links */}
      <div className="flex space-x-6">
        <Link href="/" className="hover:text-yellow-300">Home</Link>
        <Link href="/about" className="hover:text-yellow-300">About</Link>
        {!session && (
          <Link href="/login" className="hover:text-yellow-300">Login</Link>
        )}
        {session && (session?.user as { role?: string })?.role === "admin" && (
          <Link href="/admin/dashboard" className="hover:text-yellow-300">Admin Dashboard</Link>
        )}
        {session && (session?.user as { role?: string })?.role === "user" && (
          <Link href="/user/dashboard" className="hover:text-yellow-300">User Dashboard</Link>
        )}
        {session && (
          <button
            onClick={() => signOut()}
            className="hover:text-yellow-300"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}