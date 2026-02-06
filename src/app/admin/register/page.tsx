'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Loader } from 'lucide-react';

export default function RegisterUserPage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(0);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          age,
          role: 'user',
          password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('User registered successfully ✅');
        setName('');
        setAge(0);
        setPassword('');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      } else {
        setMessage(`Error: ${data.error}`);
        setIsLoading(false);
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            Register User
          </h1>
          <p className="text-gray-200">Create a new account for learning</p>
        </div>

        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center text-white">
              New User Registration
            </CardTitle>
            <p className="text-sm text-gray-200 text-center">
              Fill in the details to create a new account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-100"
                >
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter user's name"
                  required
                  disabled={isLoading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-500 focus:border-green-400 disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="age"
                  className="text-sm font-medium text-gray-100"
                >
                  Age
                </label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  placeholder="Enter age"
                  required
                  disabled={isLoading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-500 focus:border-green-400 disabled:opacity-50"
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
                  placeholder="Create a password"
                  required
                  disabled={isLoading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-500 focus:border-green-400 disabled:opacity-50"
                />
              </div>
              {message && (
                <div
                  className={`text-sm p-3 rounded-lg ${
                    message.includes('Error')
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : 'bg-green-500/10 border border-green-500/30 text-green-400'
                  }`}
                >
                  {message}
                </div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-6 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register User
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="text-center text-gray-300 text-sm mt-6">
          © 2024 neoNidhi. All rights reserved.
        </p>
      </div>
    </div>
  );
}
