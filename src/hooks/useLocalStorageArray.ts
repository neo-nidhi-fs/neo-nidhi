import { useState, useEffect } from 'react';

export function useLocalStorageArray<T extends string>(
  key: string,
  initialValue: T[] = []
) {
  const [value, setValue] = useState<T[]>(initialValue);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setValue(
            parsed.filter((item): item is T => typeof item === 'string') as T[]
          );
        }
      } catch {
        // Ignore errors
      }
    }
  }, [key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  const add = (item: T) => {
    setValue((prev) => (prev.includes(item) ? prev : [...prev, item]));
  };

  const remove = (item: T) => {
    setValue((prev) => prev.filter((i) => i !== item));
  };

  return { value, add, remove };
}
