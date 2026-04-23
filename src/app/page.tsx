'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import content from '@/content/content.json';

interface Scheme {
  _id: string;
  name: string;
  interestRate: number;
}

export default function HomePage() {
  const router = useRouter();
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  useEffect(() => {
    async function fetchSchemes() {
      const res = await fetch('/api/schemes');
      const data = await res.json();
      setSchemes(data.data);
    }
    fetchSchemes();
  }, []);

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session?.user?.id) {
        const userRole = session.user.role;
        if (userRole === 'admin' || userRole === 'privileged') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      }
    }
    checkSession();
  }, [router]);

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl">
          <div className="mb-6 inline-block">
            <span className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/50 text-blue-300 text-sm font-semibold">
              {content.home.badge}
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {content.app.name}
            </span>
            <br />
            <span className="text-gray-100">{content.app.tagline}</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {content.home.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                {content.home.ctaPrimary}
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 px-8 py-6 text-lg font-semibold transition-all duration-300"
              >
                {content.home.ctaSecondary}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-16 md:gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 md:p-6 hover:border-blue-400/50 transition-all duration-300">
              <div className="text-2xl md:text-3xl font-bold text-blue-400">
                {content.home.stats[0].value}
              </div>
              <p className="text-sm md:text-base text-gray-400">
                {content.home.stats[0].label}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 md:p-6 hover:border-blue-400/50 transition-all duration-300">
              <div className="text-2xl md:text-3xl font-bold text-cyan-400">
                {content.home.stats[1].value}
              </div>
              <p className="text-sm md:text-base text-gray-400">
                {content.home.stats[1].label}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 md:p-6 hover:border-blue-400/50 transition-all duration-300">
              <div className="text-2xl md:text-3xl font-bold text-blue-400">
                {content.home.stats[2].value}
              </div>
              <p className="text-sm md:text-base text-gray-400">
                {content.home.stats[2].label}
              </p>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 mt-20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schemes.map((s: Scheme) => (
                  <div
                    key={s._id}
                    className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-400/30 rounded-lg p-4 hover:border-purple-400/50 transition-all"
                  >
                    <h3 className="text-lg font-bold text-purple-200 mb-2">
                      {s.name}
                    </h3>
                    <p className="text-gray-100">
                      {content.home.schemes.interestRateLabel}{' '}
                      <span className="text-2xl font-bold text-purple-300">
                        {s.interestRate}%
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {content.home.featuresHeading.replace('{appName}', content.app.name)}
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {content.home.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-green-400/50 transition-all duration-300 group hover:shadow-xl hover:shadow-green-500/10">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {content.home.features[0].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 leading-relaxed">
                  {content.home.features[0].description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-orange-400/50 transition-all duration-300 group hover:shadow-xl hover:shadow-orange-500/10">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {content.home.features[1].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 leading-relaxed">
                  {content.home.features[1].description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-purple-400/50 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/10">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {content.home.features[2].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 leading-relaxed">
                  {content.home.features[2].description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content.home.ctaHeading}
          </h2>
          <p className="text-gray-200 text-lg mb-8">
            {content.home.ctaDescription.replace('{appName}', content.app.name)}
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {content.home.ctaButton}
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-700 py-8 px-6 text-center text-gray-300">
        <p>
          (c) {new Date().getFullYear()} {content.app.name}.{' '}
          {content.home.copyright}
        </p>
      </footer>
    </main>
  );
}

