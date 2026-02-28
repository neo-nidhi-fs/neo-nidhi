// Quiz API Endpoints
export const QUIZ_ENDPOINTS = {
  FETCH_QUESTIONS: '/api/quiz',
  SUBMIT_QUIZ: '/api/quiz',
  FETCH_LEADERBOARD: '/api/quiz/leaderboard',
  FETCH_SUBCATEGORIES: '/api/quiz/subCategory',
  FETCH_WIKI: '/api/quiz/wiki',
} as const;

// Quiz Constants
export const QUIZ_CONFIG = {
  QUESTIONS_PER_QUIZ: 10,
  LEADERBOARD_LIMIT: 10,
  LEADERBOARD_PREVIEW_LIMIT: 5,
  AUTO_MOVE_DELAY: 300, // milliseconds
} as const;

export const QUIZ_CATEGORIES = {
  FINANCE: 'finance',
  GENERAL: 'general',
} as const;

// Quiz UI Colors
export const QUIZ_COLORS = {
  FINANCE: {
    gradient: 'from-blue-900/30 to-indigo-900/30',
    border: 'border-blue-400/30',
    text: 'text-blue-400',
    hover: 'hover:border-blue-400/50',
  },
  GENERAL: {
    gradient: 'from-purple-900/30 to-pink-900/30',
    border: 'border-purple-400/30',
    text: 'text-purple-400',
    hover: 'hover:border-purple-400/50',
  },
} as const;

// Progress Messages
export const QUIZ_MESSAGES = {
  NOT_LOGGED_IN: 'Please log in to take quizzes',
  NO_SCORES: 'No scores yet. Be the first!',
  NO_LEADERBOARD: 'No leaderboard data yet',
  NO_INFO: 'No additional information available.',
  LOADING_INFO: 'Loading information...',
} as const;
