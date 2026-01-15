"use client";

export default function AboutPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">About neoNidhi</h1>

      <div className="max-w-3xl bg-white p-8 rounded-lg shadow space-y-6">
        {/* Intro */}
        <p className="text-lg text-gray-700">
          <span className="font-semibold">neoNidhi</span> is a playful banking app designed to help kids
          understand how money works. It shows why saving is powerful and why loans should be used carefully.
        </p>

        {/* Savings Story */}
        <div>
          <h2 className="text-2xl font-semibold text-green-700 mb-2">💰 The Magic of Savings</h2>
          <p className="text-gray-600">
            Imagine you have a piggy bank. Every time you put money in, it grows a little more because of
            <span className="font-semibold"> interest</span>. Over time, your savings become bigger than what
            you started with. This teaches the value of patience and discipline.
          </p>
        </div>

        {/* Loans Story */}
        <div>
          <h2 className="text-2xl font-semibold text-red-700 mb-2">📉 The Cost of Loans</h2>
          <p className="text-gray-600">
            Loans are like borrowing toys from a friend. You can play now, but you must return them later —
            sometimes with extra candy as a thank-you. In banking, that “extra candy” is called
            <span className="font-semibold"> interest</span>. If you borrow too much, you’ll spend more time
            paying back than enjoying your savings.
          </p>
        </div>

        {/* Lesson */}
        <div>
          <h2 className="text-2xl font-semibold text-blue-700 mb-2">🌟 The Lesson</h2>
          <p className="text-gray-600">
            Save whenever you can, and borrow only when it’s truly needed. neoNidhi helps you practice these
            habits in a safe, fun way so you grow up financially wise.
          </p>
        </div>
      </div>
    </main>
  );
}