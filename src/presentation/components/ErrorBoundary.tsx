import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/presentation/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // Here you could send the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            {/* Icon */}
            <div className="size-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">
                error
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
              Une erreur s'est produite
            </h1>

            {/* Description */}
            <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-6">
              L'application a rencontre un probleme inattendu. Nos equipes ont ete notifiees et travaillent a resoudre le probleme.
            </p>

            {/* Error Details (dev mode only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-left overflow-auto max-h-48">
                <p className="text-xs font-mono font-bold text-red-600 dark:text-red-400 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-[10px] font-mono text-zinc-500 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="md"
                icon="refresh"
                onClick={this.handleRetry}
              >
                Reessayer
              </Button>
              <Button
                variant="primary"
                size="md"
                icon="home"
                onClick={this.handleGoHome}
              >
                Retour a l'accueil
              </Button>
            </div>

            {/* Error Code */}
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Code d'erreur: ERR_{Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
