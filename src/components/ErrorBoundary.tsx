"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[200px] items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <i className="ri-error-warning-line text-2xl" />
            </div>
            <h3 className="mb-1 text-sm font-bold text-gray-900">Terjadi Kesalahan</h3>
            <p className="mb-4 text-xs text-gray-500">
              {this.state.error?.message || "Terjadi kesalahan yang tidak terduga."}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="rounded-lg bg-[#65195E] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#91157E]"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
