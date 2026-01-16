'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              About neoNidhi
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Empowering the next generation with financial literacy through
            interactive learning and real-world banking education.
          </p>
        </div>
      </section>

      {/* Intro Card Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-cyan-400">
                What is neoNidhi?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-200 leading-relaxed">
                <span className="font-semibold text-cyan-400">neoNidhi</span> is
                an innovative banking education platform designed to help
                learners of all ages understand how money works. Through
                interactive simulations and real-world scenarios, we demonstrate
                why saving is powerful and why loans should be used
                strategically to build lasting financial strength.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Why Choose neoNidhi?
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Savings Card */}
            <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-400/30 hover:border-green-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Wallet size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-400">
                  Smart Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  Understand the power of compound interest. Watch your money
                  grow over time through consistent saving habits and
                  disciplined financial planning.
                </p>
              </CardContent>
            </Card>

            {/* Growth Card */}
            <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-400">
                  Financial Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  Learn how to strategically build wealth. Master the
                  fundamentals of investing, budgeting, and long-term financial
                  planning for sustainable growth.
                </p>
              </CardContent>
            </Card>

            {/* Loans Card */}
            <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-400/30 hover:border-orange-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-orange-400">
                  Smart Borrowing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  Understand when and how to borrow responsibly. Learn the true
                  cost of loans and how to minimize debt while maintaining
                  financial stability.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Our Mission</h2>
          <p className="text-xl text-gray-300 leading-relaxed mb-12">
            {`To make financial literacy accessible, engaging, and practical for
            everyone. We believe that understanding money is a superpower, and
            we're committed to helping you master it through interactive
            learning and real-world scenarios.`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-blue-400/50 transition-all duration-300">
              <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
              <p className="text-gray-400 font-semibold">Free to Learn</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300">
              <div className="text-4xl font-bold text-cyan-400 mb-2">
                Interactive
              </div>
              <p className="text-gray-400 font-semibold">Real Scenarios</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-green-400/50 transition-all duration-300">
              <div className="text-4xl font-bold text-green-400 mb-2">Safe</div>
              <p className="text-gray-400 font-semibold">& Secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 px-6 text-center text-gray-400">
        <p>
          © 2024 neoNidhi. Making financial literacy accessible to everyone.
        </p>
      </footer>
    </main>
  );
}
