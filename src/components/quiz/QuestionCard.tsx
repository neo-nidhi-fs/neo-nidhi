'use client';

import { Card, CardContent } from '@/components/ui/card';

interface Question {
  _id: string;
  question: string;
  options: string[];
  difficulty: string;
  points: number;
}

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedOption: number | undefined;
  onSelectOption: (optionIndex: number) => void;
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
}: QuestionCardProps) {
  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <h2 className="text-xl font-semibold">Question</h2>
          <p className="text-cyan-400">
            Q{currentIndex + 1}/{totalQuestions}
          </p>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
            style={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 mb-8">
        <CardContent className="pt-6">
          <p className="text-lg font-semibold mb-6">{question.question}</p>
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onSelectOption(idx)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedOption === idx
                    ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                    : 'bg-slate-700/30 border-slate-600 text-gray-300 hover:border-slate-500'
                }`}
              >
                <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span>
                {' ' + option}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
