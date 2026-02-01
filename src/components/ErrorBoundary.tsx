/* eslint-disable react-refresh/only-export-components */
import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { AlertCircle, RotateCcw } from 'lucide-react'
import UnsupportedBrowser from './UnsupportedBrowser'

const browserSupported = 'hid' in navigator

const ErrorFallback = ({ error, onReset }: { error: Error | null; onReset: () => void }) => {
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='max-w-md'>
        <CardContent className='flex flex-col items-center gap-4 pt-6 text-center'>
          <div className='flex size-16 items-center justify-center rounded-full bg-destructive/10'>
            <AlertCircle className='size-8 text-destructive' />
          </div>

          <div className='space-y-2'>
            <h1 className='text-xl font-semibold'>Something went wrong</h1>
            <p className='text-sm text-muted-foreground'>
              An unexpected error occurred. Please try again or refresh the page.
            </p>

            {error && (
              <p className='mt-2 rounded bg-muted p-2 font-mono text-xs text-muted-foreground'>{error.message}</p>
            )}
          </div>

          <div className='flex gap-2'>
            <Button variant='outline' onClick={onReset}>
              <RotateCcw className='mr-2 size-4' />
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!browserSupported) {
      return <UnsupportedBrowser />
    }
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />
    }
    return this.props.children
  }
}
