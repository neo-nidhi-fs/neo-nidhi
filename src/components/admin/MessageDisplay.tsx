/**
 * MessageDisplay Component
 * Responsibility: Display status messages
 */

'use client';

interface MessageDisplayProps {
  message: string;
}

export function MessageDisplay({ message }: MessageDisplayProps) {
  if (!message) return null;

  const isError = message.includes('Error') || message.includes('❌');

  return (
    <div
      className={`p-3 rounded-lg text-sm ${
        isError
          ? 'bg-red-500/10 border border-red-500/30 text-red-400'
          : 'bg-green-500/10 border border-green-500/30 text-green-400'
      }`}
    >
      {message}
    </div>
  );
}
