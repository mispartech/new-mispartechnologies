import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DashboardErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="m-4">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md">
              An unexpected error occurred while loading this page. Please try again.
            </p>
            <Button onClick={this.handleReset} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
