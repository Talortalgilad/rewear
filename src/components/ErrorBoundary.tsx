import { Component, type ReactNode } from 'react';
import { EmptyArt } from './Art';

interface State { failed: boolean }

// Global safety net: any render error shows a friendly screen with a way back to a clean demo.
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(error: unknown) { console.error('ReWear crashed:', error); }

  private resetDemo = () => {
    try { localStorage.removeItem('rewear-store-v1'); } catch { /* storage unavailable, reload still gives the seed */ }
    window.location.hash = '#/';
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div dir="rtl" lang="he" className="paper flex min-h-screen items-center justify-center px-6 font-sans">
        <div className="w-full max-w-[380px] rounded-lg bg-card p-6 text-center shadow-lift">
          <div className="flex justify-center"><EmptyArt kind="hanger" /></div>
          <h1 className="mt-2 text-2xl font-black">אופס, משהו השתבש</h1>
          <p className="mt-2 text-sm text-ink-soft">קרתה שגיאה לא צפויה. אפשר לאפס את הדמו ולהתחיל מחדש.</p>
          <button onClick={this.resetDemo} className="btn btn-primary mt-5 w-full">איפוס דמו</button>
          <button onClick={() => window.location.reload()} className="btn btn-ghost mt-3 w-full text-sm">נסה שוב</button>
        </div>
      </div>
    );
  }
}
