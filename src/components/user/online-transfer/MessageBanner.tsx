interface MessageBannerProps {
  message: string;
}

export function MessageBanner({ message }: MessageBannerProps) {
  return (
    <p
      className={`p-3 rounded-lg text-sm mb-8 ${
        message.includes('❌')
          ? 'bg-red-500/10 border border-red-500/30 text-red-400'
          : 'bg-green-500/10 border border-green-500/30 text-green-400'
      }`}
    >
      {message}
    </p>
  );
}
