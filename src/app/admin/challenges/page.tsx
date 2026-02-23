'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Play, Loader } from 'lucide-react';

type Challenge = {
  _id: string;
  title: string;
  description: string;
  category: 'finance' | 'general';
  questionCount: number;
  registrationFee: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'registration' | 'started' | 'completed' | 'cancelled';
  totalPrizePool: number;
  durationMinutes?: number;
  createdAt: string;
};

export default function AdminChallengesPage() {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'finance' as 'finance' | 'general',
    questionCount: 10,
    registrationFee: 100,
    maxParticipants: 50,
    totalPrizePool: 5000,
    durationMinutes: 30,
  });

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchChallenges();
    }
  }, [session]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/challenges');
      const data = await res.json();
      if (data.success) {
        setChallenges(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/admin/challenges/${editingId}`
        : '/api/admin/challenges';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: session.user.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(editingId ? '✅ Challenge updated' : '✅ Challenge created');
        resetForm();
        setTimeout(() => {
          setCreateDialogOpen(false);
          fetchChallenges();
        }, 1000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/challenges/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Challenge deleted');
        fetchChallenges();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage(`❌ Error deleting challenge`);
    }
  };

  const handleStart = async (id: string) => {
    if (!confirm('Start this challenge? Registration fees will be deducted.'))
      return;

    try {
      const res = await fetch(`/api/admin/challenges/${id}/start`, {
        method: 'POST',
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Challenge started!');
        fetchChallenges();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage(`❌ Error starting challenge`);
    }
  };

  const handleEdit = (challenge: Challenge) => {
    setFormData({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      questionCount: challenge.questionCount,
      registrationFee: challenge.registrationFee,
      maxParticipants: challenge.maxParticipants,
      totalPrizePool: challenge.totalPrizePool,
      durationMinutes: challenge.durationMinutes || 30,
    });
    setEditingId(challenge._id);
    setCreateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'finance',
      questionCount: 10,
      registrationFee: 100,
      maxParticipants: 50,
      totalPrizePool: 5000,
      durationMinutes: 30,
    });
    setEditingId(null);
    setMessage('');
  };

  if (session?.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black mb-2">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Manage Challenges
              </span>
            </h1>
            <p className="text-gray-200">
              Create, edit, and manage user challenges
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Create Challenge
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Challenge' : 'Create New Challenge'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Challenge title"
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Challenge description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as 'finance' | 'general',
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                    >
                      <option value="finance">Finance</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div>
                    <Label>Questions</Label>
                    <Input
                      type="number"
                      value={formData.questionCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          questionCount: Number(e.target.value),
                        })
                      }
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Registration Fee</Label>
                    <Input
                      type="number"
                      value={formData.registrationFee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationFee: Number(e.target.value),
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <Label>Prize Pool</Label>
                    <Input
                      type="number"
                      value={formData.totalPrizePool}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalPrizePool: Number(e.target.value),
                        })
                      }
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Max Participants</Label>
                    <Input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxParticipants: Number(e.target.value),
                        })
                      }
                      min="2"
                    />
                  </div>

                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationMinutes: Number(e.target.value),
                        })
                      }
                      min="5"
                      max="300"
                    />
                  </div>
                </div>

                {message && (
                  <div className="p-3 bg-slate-800 rounded text-sm">
                    {message}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <>
                      <Loader size={18} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : editingId ? (
                    'Update Challenge'
                  ) : (
                    'Create Challenge'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : challenges.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center text-gray-400">
              No challenges yet. Create one to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {challenges.map((challenge) => (
              <Card
                key={challenge._id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-slate-600 transition"
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-cyan-400">
                        {challenge.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {challenge.description}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        challenge.status === 'registration'
                          ? 'bg-blue-900/30 text-blue-300'
                          : challenge.status === 'started'
                            ? 'bg-green-900/30 text-green-300'
                            : 'bg-gray-900/30 text-gray-300'
                      }`}
                    >
                      {challenge.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-700/30 p-3 rounded">
                      <p className="text-xs text-gray-400">Questions</p>
                      <p className="text-lg font-bold text-cyan-400">
                        {challenge.questionCount}
                      </p>
                    </div>
                    <div className="bg-slate-700/30 p-3 rounded">
                      <p className="text-xs text-gray-400">Fee</p>
                      <p className="text-lg font-bold text-green-400">
                        ₹{challenge.registrationFee}
                      </p>
                    </div>
                    <div className="bg-slate-700/30 p-3 rounded">
                      <p className="text-xs text-gray-400">Participants</p>
                      <p className="text-lg font-bold text-blue-400">
                        {challenge.currentParticipants}/
                        {challenge.maxParticipants}
                      </p>
                    </div>
                    <div className="bg-slate-700/30 p-3 rounded">
                      <p className="text-xs text-gray-400">Prize Pool</p>
                      <p className="text-lg font-bold text-purple-400">
                        ₹{challenge.totalPrizePool}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {challenge.status === 'registration' && (
                      <>
                        <Button
                          onClick={() => handleStart(challenge._id)}
                          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                        >
                          <Play size={16} />
                          Start Challenge
                        </Button>
                        <Button
                          onClick={() => handleEdit(challenge)}
                          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </Button>
                      </>
                    )}

                    <Button
                      onClick={() => handleDelete(challenge._id)}
                      className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                      disabled={challenge.currentParticipants > 0}
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
