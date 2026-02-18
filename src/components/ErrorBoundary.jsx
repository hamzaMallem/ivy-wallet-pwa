import { Component } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="mb-2 flex justify-center">
                <AlertTriangle className="h-12 w-12 text-error" />
              </div>
              <CardTitle className="text-center">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-outline">
                The app encountered an unexpected error. Try refreshing the page.
              </p>
              {this.state.error && (
                <details className="rounded-lg bg-surface-variant p-3">
                  <summary className="cursor-pointer text-xs font-medium">
                    Error details
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs text-outline">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.href = '/';
                  }}
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
