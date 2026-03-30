'use client';

import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Loader, PiggyBank } from 'lucide-react';

// Placeholder for feature list, can be extended
const FEATURES = [
  {
    key: 'financeFeaturesEnabled',
    label: 'Personal Finance',
    icon: PiggyBank,
    bg: 'bg-[url(/feature-bg-finance.svg)] bg-cover bg-center',
  },
  // Add more features here as needed
];

export default function AdminFeatureTogglesPage() {
  const { users, loading, updateUserFinanceFeatures } = useAdminUsers();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [search, setSearch] = useState('');
  const selectedUser = users.find((u) => u._id === selectedUserId);

  // Filter users by search
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (featureKey, enabled) => {
    if (!selectedUserId) return;
    if (featureKey === 'financeFeaturesEnabled') {
      await updateUserFinanceFeatures(selectedUserId, enabled);
    }
    // Add more feature update logic here
  };

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Feature Toggles</h1>
        {/* User Search/Select Dropdown */}
        <div className="mb-8">
          <label className="block text-gray-200 mb-2">Select User</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-slate-700 mb-2"
            placeholder="Search user by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-slate-700"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">-- Select a user --</option>
            {filteredUsers.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.name})
              </option>
            ))}
          </select>
        </div>
        {/* Feature Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature) => {
            const enabled = selectedUser ? selectedUser[feature.key] : false;
            const Icon = feature.icon;
            return (
              <div
                key={feature.key}
                className={`relative rounded-lg border border-slate-700 bg-slate-900/60 p-6 flex flex-col items-start shadow-lg overflow-hidden ${feature.bg} ${!selectedUserId ? 'opacity-50 pointer-events-none select-none' : ''}`}
              >
                {/* Subtle background overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" />
                <div className="flex items-center justify-between w-full z-10">
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8 text-blue-400 drop-shadow" />
                    <span className="text-lg font-semibold">
                      {feature.label}
                    </span>
                  </div>
                  <button
                    className={`ml-4 w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                      enabled ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                    disabled={!selectedUserId || loading}
                    tabIndex={!selectedUserId ? -1 : 0}
                    aria-disabled={!selectedUserId}
                    onClick={() =>
                      selectedUserId && handleToggle(feature.key, !enabled)
                    }
                  >
                    <span
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-2 text-gray-300 text-sm z-10">
                  {feature.label} is {enabled ? 'enabled' : 'disabled'} for this
                  user.
                </div>
              </div>
            );
          })}
        </div>
        {loading && (
          <div className="flex items-center justify-center mt-8">
            <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        )}
      </div>
    </main>
  );
}
