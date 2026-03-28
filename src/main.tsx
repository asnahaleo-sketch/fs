import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[App Error]', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: '#fff', background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>⚠️ App Crashed</h2>
          <pre style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', maxWidth: '90vw', overflow: 'auto', color: '#fca5a5', fontSize: '13px' }}>
            {this.state.error.message}
          </pre>
          <p style={{ color: '#666', marginTop: '1rem', fontSize: '12px' }}>Check the browser console (F12) for the full stack trace.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)

