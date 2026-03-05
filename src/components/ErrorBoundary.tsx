import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                    <div className="bg-surface rounded-xl shadow-sm border border-danger/20 p-8 max-w-lg w-full">
                        <div className="flex items-center gap-3 mb-4 text-danger">
                            <AlertTriangle size={24} />
                            <h1 className="text-xl font-bold">Something went wrong</h1>
                        </div>
                        <p className="text-secondary mb-4 break-words">
                            {this.state.error?.message || "An unexpected error occurred in the React application tree."}
                        </p>
                        <button
                            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors w-full"
                            onClick={() => window.location.reload()}
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
