import { ProgressSpinner } from 'primereact/progressspinner';

export const PageLoader = ({ globalLoading }: { globalLoading: boolean }) => {
    if (!globalLoading) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1),transparent_40%)]" />
            <div className="relative flex flex-col items-center text-white space-y-6 animate-fadeIn">
                <ProgressSpinner
                    style={{ width: '80px', height: '80px' }}
                    strokeWidth="4"
                    fill="transparent"
                    animationDuration=".8s"
                />
                <h1 className="text-2xl font-semibold tracking-wide drop-shadow-lg">
                    Loading your experience…
                </h1>
                <p className="text-sm opacity-90">
                    Please wait while we prepare everything for you.
                </p>
            </div>
        </div>
    );
}
