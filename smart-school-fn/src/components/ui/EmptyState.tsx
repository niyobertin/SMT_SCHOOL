import type { LucideIcon } from 'lucide-react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Shared empty state component.
 * Used in list pages (Candidates, Exams, Results, Courses, etc.)
 * when data is absent or a search returns no results.
 */
export const EmptyState = ({
    title,
    description,
    icon: Icon = FileX,
    action,
}: EmptyStateProps) => {
    return (
        <div
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
            role="status"
            aria-label={title}
        >
            <div className="p-4 bg-slate-100 rounded-2xl mb-4">
                <Icon className="w-10 h-10 text-slate-400" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-slate-500 max-w-sm">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-6 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};
