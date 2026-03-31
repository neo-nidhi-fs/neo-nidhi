import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function UserJoinedChallenges({
  userJoinedChallenges,
  userChallenges,
}) {
  return (
    <>
      {/* Your Challenges */}
      {userJoinedChallenges.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">
            Your Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userJoinedChallenges.map((challenge) => {
              const userStatus = userChallenges.find(
                (uc) => uc.challengeId === challenge._id
              )?.status;
              return (
                <Card
                  key={challenge._id}
                  className="bg-gradient-to-br from-green-900/30 to-slate-900/50 border-green-400/30"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-green-400">
                        {challenge.title}
                      </CardTitle>
                      <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                        <CheckCircle size={14} />
                        Joined
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-700/30 rounded p-3">
                        <p className="text-xs text-gray-400">Questions</p>
                        <p className="text-lg font-bold text-cyan-400">
                          {challenge.questionCount}
                        </p>
                      </div>
                      <div className="bg-slate-700/30 rounded p-3">
                        <p className="text-xs text-gray-400">Prize Pool</p>
                        <p className="text-lg font-bold text-purple-400">
                          â‚¹{challenge.totalPrizePool}
                        </p>
                      </div>
                    </div>

                    {userStatus === 'started' && (
                      <Link href={`/user/challenges/${challenge._id}`}>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          Continue Challenge
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
