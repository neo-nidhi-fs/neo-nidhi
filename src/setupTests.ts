import '@testing-library/jest-dom';

// Provide a safe global fetch for tests that use relative URLs.
// Individual tests should stub `fetch` when they need specific responses.
const _originalFetch = globalThis.fetch;

globalThis.fetch = async (input: RequestInfo, init?: RequestInit) => {
  try {
    let urlStr = typeof input === 'string' ? input : (input as Request).url;
    // Treat relative paths or localhost targets as test-only and return empty JSON by default.
    if (typeof urlStr === 'string' && (urlStr.startsWith('/') || urlStr.includes('localhost'))) {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (e) {
    // fallthrough to original fetch
  }

  // Fallback to original fetch if available, otherwise return empty JSON.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (_originalFetch) return _originalFetch(input as any, init as any);
  return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
