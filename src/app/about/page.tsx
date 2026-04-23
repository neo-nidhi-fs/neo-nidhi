'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Shield } from 'lucide-react';
import content from '@/content/content.json';

export default function AboutPage() {
  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {content.about.heroTitle.replace('{appName}', content.app.name)}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            {content.about.heroSubtitle}
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-cyan-400">
                {content.about.introTitle.replace('{appName}', content.app.name)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-100 leading-relaxed">
                {content.about.introDescription.replace(
                  '{appName}',
                  content.app.name
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {content.about.featuresHeading.replace('{appName}', content.app.name)}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-400/30 hover:border-green-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Wallet size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-400">
                  {content.about.features[0].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 leading-relaxed">
                  {content.about.features[0].description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-400">
                  {content.about.features[1].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 leading-relaxed">
                  {content.about.features[1].description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-400/30 hover:border-orange-400/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-orange-400">
                  {content.about.features[2].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 leading-relaxed">
                  {content.about.features[2].description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            {content.about.missionHeading}
          </h2>
          <p className="text-xl text-gray-200 leading-relaxed mb-12">
            {content.about.missionDescription}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-blue-400/50 transition-all duration-300">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {content.about.stats[0].value}
              </div>
              <p className="text-gray-200 font-semibold">
                {content.about.stats[0].label}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300">
              <div className="text-4xl font-bold text-cyan-400 mb-2">
                {content.about.stats[1].value}
              </div>
              <p className="text-gray-200 font-semibold">
                {content.about.stats[1].label}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-green-400/50 transition-all duration-300">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {content.about.stats[2].value}
              </div>
              <p className="text-gray-200 font-semibold">
                {content.about.stats[2].label}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-700 py-8 px-6 text-center text-gray-300">
        <p>
          (c) {new Date().getFullYear()} {content.app.name}.{' '}
          {content.about.copyright}
        </p>
      </footer>
    </main>
  );
}

