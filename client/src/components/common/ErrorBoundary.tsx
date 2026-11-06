import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryState {
  error: Error | null;
}

/** Last line of defence for render-time crashes outside the router's own error elements. */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Hook for an error-reporting service (Sentry, etc.) in a later phase.
    console.error('Unhandled UI error', error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <ErrorState
          fullPage
          title="The app ran into a problem"
          message="Reload the page to continue. If it keeps happening, contact your administrator."
          retryLabel="Reload page"
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}
