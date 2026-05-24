// Use a simple function component with window.onerror fallback for error catching
// since class components have TS issues in this project's config
import { useState, useEffect, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// Global error state broadcaster
let _setGlobalError: ((err: Error) => void) | null = null;

if (typeof window !== 'undefined') {
  window.onerror = (msg, src, line, col, error) => {
    if (_setGlobalError && error) _setGlobalError(error);
    return false;
  };
  window.addEventListener('unhandledrejection', (e) => {
    if (_setGlobalError) _setGlobalError(new Error(String(e.reason)));
  });
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    _setGlobalError = setError;
    return () => { _setGlobalError = null; };
  }, []);

  if (!error) return <>{children}</>;

  return (
    <div style={{
      minHeight: '100vh', background: '#06070B',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Urbanist, ui-sans-serif, system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
        }}>
          <AlertTriangle style={{ width: 32, height: 32, color: '#ef4444' }} />
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
          Something went wrong
        </h1>
        <p style={{ color: '#6b7280', fontWeight: 700, marginBottom: 24, lineHeight: 1.6, fontSize: 14 }}>
          StickyFlow crashed. Your notes are safe — they're synced to the cloud.
        </p>

        <details style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '12px 16px', marginBottom: 24, textAlign: 'left', cursor: 'pointer'
        }}>
          <summary style={{ color: '#6b7280', fontSize: 12, fontWeight: 700 }}>Error details</summary>
          <pre style={{
            color: '#ef4444', fontSize: 11, marginTop: 8, overflow: 'auto',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 120, fontFamily: 'monospace'
          }}>{error.message}</pre>
        </details>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setError(null)} style={{
            padding: '12px 24px', borderRadius: 14,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#9ca3af', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Try to Continue
          </button>
          <button onClick={() => window.location.reload()} style={{
            padding: '12px 24px', borderRadius: 14, background: '#A5C9FF', color: '#000',
            border: 'none', fontWeight: 900, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit'
          }}>
            <RefreshCw style={{ width: 16, height: 16 }} />
            Reload App
          </button>
        </div>
      </div>
    </div>
  );
}
