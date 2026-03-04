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
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_15px_30px_rgb(0,0,0,0.05)] hover:border-[#1a7ea5]/20 transition-all duration-300 group"
    >
        <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 p-2 rounded-xl ${color} bg-opacity-10 text-opacity-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={18} className={color.replace('bg-', 'text-')} strokeWidth={2.5} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{value}</h3>
                    {change && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-[9px] font-bold text-emerald-600 border border-emerald-100/50 flex-shrink-0">
                            {change}
                        </span>
                    )}
                </div>
            </div>
        </div>
    </motion.div>
);