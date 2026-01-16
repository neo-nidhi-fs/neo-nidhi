"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";


interface CustomSession extends Session {
  user?: Session["user"] & {
    role?: string;
  };
}

export default function Navbar() {
  const { data: session } = useSession() as { data: CustomSession | null };
  const userRole = session?.user?.role;
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false }); // prevent NextAuth default redirect
    router.push("/"); // ✅ redirect to Home after logout
  }

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center shadow">
      {/* App Logo */}
      <Link href="/" className="text-2xl font-bold hover:text-yellow-300">
        neoNidhi
      </Link>

      {/* Navigation Links */}
      <div className="flex space-x-6">
        {/* Show Home only if NOT logged in */}
        {!session && (
          <Link href="/" className="hover:text-yellow-300">Home</Link>
        )}


        <Link href="/about" className="hover:text-yellow-300">About</Link>

        {!session && (
          <Link href="/login" className="hover:text-yellow-300">Login</Link>
        )}

        {session && userRole === "admin" && (
          <>
            <Link href="/admin/dashboard" className="hover:text-yellow-300">
              Admin Dashboard
            </Link>
            <Link href="/admin/transactions" className="hover:text-yellow-300">
              Transactions
            </Link>
          </>
        )}

        {session && userRole === "user" && (
          <Link href="/user/dashboard" className="hover:text-yellow-300">
            User Dashboard
          </Link>
        )}

       {session && (
          <button
            onClick={handleLogout}
            className="hover:text-yellow-300"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}