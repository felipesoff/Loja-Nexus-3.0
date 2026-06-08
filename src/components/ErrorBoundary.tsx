import * as React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-[40px] border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-red-600 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-black text-black tracking-tighter mb-2 uppercase">Ops! Algo deu errado</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md">
            Ocorreu um erro inesperado ao carregar este componente. Por favor, tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all"
          >
            Recarregar Página
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-8 p-4 bg-white border border-red-200 rounded-xl text-left text-xs text-red-500 overflow-auto max-w-full">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
