import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    change?: string;
    subtitle?: string;
}

/**
 * Shared stats card used in both:
 *  - LMS Dashboard (DashboardHome.tsx)
 *  - Exam Admin Dashboard (exam-admin/Dashboard)
 *
 * Moved from Dashboards/StatsCard.tsx — the old file re-exports from here
 * so existing imports remain unbroken.
 */
export const StatsCard = ({ title, value, icon: Icon, color, change, subtitle }: StatsCardProps) => {
    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
                <div className={`p-2 ${color} rounded-xl`}>
                    <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
            {(change || subtitle) && (
                <div className="mt-3 flex items-center gap-2">
                    {change && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {change}
                        </span>
                    )}
                    {subtitle && (
                        <span className="text-xs text-slate-400 font-medium">{subtitle}</span>
                    )}
                </div>
            )}
        </div>
    );
};
