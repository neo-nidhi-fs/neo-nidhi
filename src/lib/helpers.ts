/**
 * Extracts important keywords from a text string
 * Removes common words and returns the most relevant phrase
 */
export function extractKeywordPhrase(text: string): string {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'be', 'are', 'been',
    'if', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'do', 'does',
    'did', 'have', 'has', 'had', 'could', 'would', 'should', 'may', 'might',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0 && !commonWords.has(word));

  return words.slice(0, 3).join(' ');
}

/**
 * Formats currency to INR format
 */
export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Validates MPIN format
 */
export function validateMPIN(mpin: string): boolean {
  return /^\d{4}$/.test(mpin);
}

/**
 * Formats date to readable string
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculates time remaining in seconds
 */
export function calculateTimeRemaining(endDate: string | Date): number {
  return Math.max(0, Math.floor((new Date(endDate).getTime() - Date.now()) / 1000));
}

/**
 * Converts seconds to human readable format (HH:MM:SS)
 */
export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
