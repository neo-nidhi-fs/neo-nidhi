export interface Recipient {
  id: string;
  name: string;
}

interface RecentRecipientsProps {
  recipients: Recipient[];
  getInitials: (name: string) => string;
  onSelect: (name: string) => void;
}

export function RecentRecipients({
  recipients,
  getInitials,
  onSelect,
}: RecentRecipientsProps) {
  if (!recipients.length) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Recently Sent</h2>
        <p className="text-sm text-gray-400">Tap a user to send again</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {recipients.map((recipient) => (
          <button
            key={recipient.id}
            type="button"
            onClick={() => onSelect(recipient.name)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition"
          >
            <span className="w-10 h-10 rounded-full bg-indigo-500/80 flex items-center justify-center text-white font-semibold">
              {getInitials(recipient.name)}
            </span>
            <span className="text-sm text-gray-200 truncate max-w-[140px]">
              {recipient.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
