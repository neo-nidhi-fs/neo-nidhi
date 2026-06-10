import { describe, it, expect } from 'vitest';
import { useEffect } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuizState } from './useQuizState';

function QuizStateTest() {
  const {
    category,
    setCategory,
    currentQuestion,
    answers,
    handleAnswer,
    setQuestions,
  } = useQuizState();

  useEffect(() => {
    setQuestions([
      {
        _id: 'q1',
        question: 'What is 1+1?',
        options: ['2', '3'],
        answerIndex: 0,
      },
      {
        _id: 'q2',
        question: 'What is 2+2?',
        options: ['3', '4'],
        answerIndex: 1,
      },
    ]);
  }, [setQuestions]);

  return (
    <div>
      <span data-testid="category">{category ?? 'none'}</span>
      <span data-testid="current-question">{currentQuestion}</span>
      <span data-testid="answer-count">{answers.length}</span>
      <button type="button" onClick={() => setCategory('finance')}>
        Set Category
      </button>
      <button type="button" onClick={() => handleAnswer(0)}>
        Submit Answer
      </button>
    </div>
  );
}

describe('useQuizState', () => {
  it('allows category selection and handles an answer submission', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<QuizStateTest />);
    });

    expect(screen.getByTestId('category')).toHaveTextContent('none');
    expect(screen.getByTestId('current-question')).toHaveTextContent('0');
    expect(screen.getByTestId('answer-count')).toHaveTextContent('0');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /set category/i }));
    });
    expect(screen.getByTestId('category')).toHaveTextContent('finance');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /submit answer/i }));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    expect(screen.getByTestId('answer-count')).toHaveTextContent('1');
    expect(screen.getByTestId('current-question')).toHaveTextContent('1');
  });
});
