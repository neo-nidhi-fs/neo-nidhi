// utils/extractKeyword.ts
const stopwords = [
  'in',
  'which',
  'year',
  'did',
  'the',
  'of',
  'occur',
  'is',
  'was',
  'are',
  'a',
  'an',
  'on',
  'at',
  'by',
  'to',
];

export function extractKeywordPhrase(question: string): string {
  const words = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .split(/\s+/)
    .filter((word) => !stopwords.includes(word));

  // Capitalize each word for Wikipedia-friendly query
  const phrase = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return phrase;
}
