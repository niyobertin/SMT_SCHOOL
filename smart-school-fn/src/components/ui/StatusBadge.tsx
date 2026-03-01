interface StatusBadgeProps {
    status: string;
    /**
     * Explicit color variant. If omitted, derived from `status` value automatically.
     * Always renders the status text (never color-only) — WCAG AA compliant.
     */
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

const STATUS_VARIANTS: Record<string, StatusBadgeProps['variant']> = {
    // Attempt statuses
    PASSED: 'success',
    APPROVED: 'success',
    GRADED: 'success',
    PUBLISHED: 'success',
    ACTIVE: 'success',
    // Warning
    IN_PROGRESS: 'warning',
    PENDING_APPROVAL: 'warning',
    DRAFT: 'warning',
    SUBMITTED: 'info',
    // Error
    FAILED: 'error',
    TIMED_OUT: 'error',
    ARCHIVED: 'neutral',
    INACTIVE: 'neutral',
};

const VARIANT_CLASSES: Record<NonNullable<StatusBadgeProps['variant']>, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

const DOT_CLASSES: Record<NonNullable<StatusBadgeProps['variant']>, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-400',
};

/**
 * WCAG-compliant status badge.
 * - Always shows text (never color-only).
 * - Colored dot is aria-hidden; the text is the semantic indicator.
 */
export const StatusBadge = ({ status, variant }: StatusBadgeProps) => {
    const resolvedVariant = variant ?? STATUS_VARIANTS[status] ?? 'neutral';
    const displayText = status.replace(/_/g, ' ');

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${VARIANT_CLASSES[resolvedVariant]}`}
            role="status"
        >
            <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_CLASSES[resolvedVariant]}`}
                aria-hidden="true"
            />
            {displayText}
        </span>
    );
};
