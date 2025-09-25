import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    change?: string;
}

export const StatsCard = ({ title, value, icon: Icon, color, change }: StatsCardProps) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {change && <p className="text-sm text-green-600 mt-1">{change}</p>}
            </div>
            <div className={`${color} p-3 rounded-lg`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);