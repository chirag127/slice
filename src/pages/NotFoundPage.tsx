import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export function NotFoundPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="bg-surface rounded-xl shadow-sm border border-border p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} />
                </div>
                <h1 className="text-2xl font-bold text-primary mb-2">Page Not Found</h1>
                <p className="text-secondary mb-6">
                    The page you are looking for doesn't exist or you don't have permission to access it.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center justify-center px-4 py-2 bg-accent text-white font-medium rounded-md hover:bg-accent/90 transition-colors w-full"
                >
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}
