import { useEffect, useState } from 'react';
import { Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import api from '../../redux/api/api';

interface ActivityLog {
    id: string;
    userId: string;
    action: string;
    user: {
        username: string;
        role: string;
    };
    details: string;
    ip: string;
    createdAt: string;
}

export const ActivityLogs = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/users/dashboard/stats');
                if (response.data.status === 'success') {
                    // Assuming the same endpoint for now as it contains logs
                    setLogs(response.data.data.logs);
                } else {
                    throw new Error('Failed to fetch activity logs');
                }
            } catch (err) {
                console.error('Error fetching activity logs:', err);
                setError('Failed to load activity logs');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton width={250} height={40} />
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {Array.from({ length: 10 }).map((_, idx) => (
                        <div key={idx} className="p-6 border-b border-slate-50">
                            <Skeleton height={20} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl shadow-sm flex items-center gap-4">
                    <Activity className="h-6 w-6 text-red-500" />
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">System Activity</h1>
                    <p className="text-slate-500 font-medium mt-1">Audit logs and recent system events.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                    <Activity className="w-5 h-5 text-[#1a7ea5]" />
                    <span className="text-sm font-bold text-slate-700">{logs.length} Total Events</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">IP Address</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-[#1a7ea5]/10 flex items-center justify-center text-[#1a7ea5] font-bold text-xs border border-[#1a7ea5]/20">
                                                {log.user?.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{log.user?.username}</p>
                                                <p className="text-[11px] text-slate-400 font-medium">{log.user?.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                                            <Clock className="w-3 h-3" />
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600 line-clamp-1 max-w-xs">{log.details || 'No additional details'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{log.ip}</code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-medium font-mono">
                                                {new Date(log.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};
