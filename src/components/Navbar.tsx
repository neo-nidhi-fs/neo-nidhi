'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface CustomSession extends Session {
  user?: Session['user'] & {
    role?: string;
  };
}

export default function Navbar() {
  const { data: session } = useSession() as { data: CustomSession | null };
  const userRole = session?.user?.role;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push('/');
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white px-6 py-4 shadow-lg sticky top-0 z-50 backdrop-blur-sm">
      <div className="flex justify-between items-center w-full">
        <Link
          href="/"
          className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-cyan-300 transition-all duration-300"
        >
          neoNidhi
        </Link>

        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`absolute md:static items-center top-full left-0 right-0 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 md:bg-none flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 p-6 md:p-0 transition-all duration-300 ${
          isOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        {!session && (
          <Link
            href="/"
            className="text-gray-200 hover:text-blue-400 transition-colors duration-300 font-medium"
          >
            Home
          </Link>
        )}

        <Link
          href="/about"
          className="text-gray-200 hover:text-blue-400 transition-colors duration-300 font-medium"
        >
          About
        </Link>

        {!session && (
          <Link
            href="/login"
            className="text-gray-200 hover:text-blue-400 transition-colors duration-300 font-medium"
          >
            Login
          </Link>
        )}

        {session && userRole === 'admin' && (
          <>
            <Link
              href="/admin/dashboard"
              className="text-gray-200 hover:text-blue-400 transition-colors duration-300 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/transactions"
              className="text-gray-200 hover:text-blue-400 transition-colors duration-300 font-medium"
            >
              Transactions
            </Link>
          </>
        )}

        {session && userRole === 'user' && (
          <>
            <Link
              href="/user/dashboard"
              className="text-gray-200 hover:text-blue-400 transition-colors duration-300 font-medium"
            >
              Dashboard
            </Link>
            <Link href="/user/passbook">Passbook</Link>
          </>
        )}

        {session && (
          <button
            onClick={handleLogout}
            className="text-gray-200 hover:text-red-400 transition-colors duration-300 font-medium px-4 py-2 rounded-lg hover:bg-red-900/20"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
