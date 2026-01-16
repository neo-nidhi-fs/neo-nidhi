'use client';

import { useEffect, useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signIn('credentials', {
      name,
      password,
      redirect: false,
    });

    console.log('result ==> ', result);
    if (result?.error) {
      setError('Invalid credentials. Please try again.');
      setIsLoading(false);
    } else {
      // Get session to retrieve user ID
      const session = await getSession();
      console.log('session ==> ', session);

      if (session?.user?.id) {
        const userRole = session.user.role;
        if (userRole === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      }
    }
  };

  useEffect(() => {
    // Redirect if already logged in
    async function checkSession() {
      const session = await getSession();
      if (session?.user?.id) {
        const userRole = session.user.role;
        if (userRole === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      }
    }
    checkSession();
  }, [router]);

  return (
    <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            neoNidhi
          </h1>
          <p className="text-gray-200">Master Your Finances</p>
        </div>

        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center text-white">
              Welcome Back
            </CardTitle>
            <p className="text-sm text-gray-200 text-center">
              Login to your account and continue learning
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-100"
                >
                  Username
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-500 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-100"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-500 focus:border-blue-400"
                />
              </div>
              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Logging in...' : 'Login'}
                {!isLoading && <ArrowRight size={16} />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2024 neoNidhi. All rights reserved.
        </p>
      </div>
    </div>
  );
}
