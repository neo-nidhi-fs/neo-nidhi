"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-blue-700 mb-4">neoNidhi</h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto">
          Welcome to <span className="font-semibold">neoNidhi</span> — a fun way to learn how banking works! 
          Discover the importance of saving money and why avoiding unwanted loans helps you stay financially strong.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-12">
        <Link href="/login">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Login
          </Button>
        </Link>
        <Link href="/about">
          <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            About neoNidhi
          </Button>
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Savings grow with interest over time. The more you save, the more rewards you earn!
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <span className="text-2xl">📉</span>
              Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Loans can help in emergencies, but they cost more because of interest. Avoid unnecessary loans to stay debt-free.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}