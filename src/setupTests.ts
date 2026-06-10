import '@testing-library/jest-dom';

// Provide a safe global fetch for tests that use relative URLs.
// Individual tests should stub `fetch` when they need specific responses.
const _originalFetch = globalThis.fetch;

function customFetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
function customFetch(input: URL, init?: RequestInit): Promise<Response>;
async function customFetch(input: RequestInfo | URL, init?: RequestInit) {
  try {
    let urlStr: string;
    if (typeof input === 'string') {
      urlStr = input;
    } else if (input instanceof URL) {
      urlStr = input.toString();
    } else {
      urlStr = input.url;
    }

    // Treat relative paths or localhost targets as test-only and return empty JSON by default.
    if (urlStr.startsWith('/') || urlStr.includes('localhost')) {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (e) {
    // fallthrough to original fetch
  }

  if (_originalFetch) return _originalFetch(input as any, init as any);
  return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

globalThis.fetch = customFetch as typeof globalThis.fetch;
