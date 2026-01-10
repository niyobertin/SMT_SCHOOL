import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    change?: string;
}

export const StatsCard = ({ title, value, icon: Icon, color, change }: StatsCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="bg-white rounded-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900 leading-tight">{value}</p>
                </div>
                {change && (
                    <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{change}</span>
                        <span className="text-[10px] text-gray-400 font-medium">vs last month</span>
                    </div>
                )}
            </div>
            <div className={`p-4 rounded-xl ${color} bg-opacity-10 text-opacity-100 flex items-center justify-center shadow-inner`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    </motion.div>
);