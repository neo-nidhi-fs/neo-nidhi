import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useLocalStorage from './useLocalstorage';

function LocalStorageTest({ storageKey, initialValue }: { storageKey: string; initialValue: string }) {
  const [value, setValue] = useLocalStorage(storageKey, initialValue);

  return (
    <div>
      <span data-testid="stored-value">{String(value)}</span>
      <button type="button" onClick={() => setValue('updated')}>
        Update
      </button>
    </div>
  );
}

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses the default value when no existing localStorage entry exists', () => {
    render(<LocalStorageTest storageKey="test-key" initialValue="default" />);

    expect(screen.getByTestId('stored-value')).toHaveTextContent('default');
  });

  it('reads the existing value from localStorage', () => {
    localStorage.setItem('stored-key', JSON.stringify('saved'));

    render(<LocalStorageTest storageKey="stored-key" initialValue="default" />);

    expect(screen.getByTestId('stored-value')).toHaveTextContent('saved');
  });

  it('updates localStorage when the value changes', async () => {
    const user = userEvent.setup();
    render(<LocalStorageTest storageKey="test-key" initialValue="default" />);

    await user.click(screen.getByRole('button', { name: /update/i }));

    expect(screen.getByTestId('stored-value')).toHaveTextContent('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });
});
