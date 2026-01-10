import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, CreditCard, TrendingUp, Calendar, ArrowUpRight, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../redux/api/api";
import Skeleton from "react-loading-skeleton";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  channel: string;
  subscriptionPeriod: number;
  remainingPeriod: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

interface PaymentStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  failed: number;
  amount: number;
}

export const SubscriptionsSection = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    amount: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/payments?page=${currentPage}&limit=${itemsPerPage}`);
        setPayments(response.data.payments);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage));
        setStats({
          total: response.data.total,
          active: response.data.active,
          pending: response.data.pending,
          completed: response.data.completed,
          failed: response.data.failed,
          amount: response.data.amount
        });
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentPage, itemsPerPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5 shadow-sm">
          <CheckCircle2 size={12} strokeWidth={3} /> Success
        </span>;
      case 'PENDING':
        return <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1.5 shadow-sm">
          <Clock size={12} strokeWidth={3} /> Processing
        </span>;
      case 'FAILED':
        return <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1.5 shadow-sm">
          <XCircle size={12} strokeWidth={3} /> Failed
        </span>;
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-0 bg-[#f8fafc] min-h-screen">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2">
            <Skeleton width={200} height={30} />
            <Skeleton width={300} height={20} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
              <Skeleton height={20} width={100} className="mb-4" />
              <Skeleton height={40} width={120} />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 h-96">
          <Skeleton height="100%" borderRadius={24} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-0"
    >
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Subscriptions</h1>
          <p className="text-slate-500 font-medium mt-3">Monitor financial performance and active user memberships.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <Calendar className="w-5 h-5 text-[#1a7ea5]" />
          <span className="text-sm font-bold text-slate-700">
            {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* High-Level Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 group transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-[#1a7ea5] rounded-xl group-hover:bg-[#1a7ea5] group-hover:text-white transition-all duration-300">
              <CreditCard size={20} />
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Total Volume</h3>
          <p className="text-2xl font-bold text-slate-900 leading-none">{stats.total.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">Historical</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 group transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
              <CheckCircle2 size={20} />
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Active Plans</h3>
          <p className="text-2xl font-bold text-slate-900 leading-none">{stats.active.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400">Current Users</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 group transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#1a7ea5]/10 text-[#1a7ea5] rounded-xl group-hover:bg-[#1a7ea5] group-hover:text-white transition-all duration-300">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-slate-900 leading-none">{stats.amount.toLocaleString()} <span className="text-xs text-slate-400 font-bold ml-1">RWF</span></p>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#1a7ea5] bg-[#1a7ea5]/5 px-2 py-0.5 rounded-lg">All Time</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 group transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Success Rate</h3>
          <p className="text-2xl font-bold text-slate-900 leading-none">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </p>
          <div className="mt-4 flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%` }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Transactions</h2>
            <p className="text-xs font-medium text-slate-400 mt-1">Real-time payment audit log</p>
          </div>
          <button className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:text-[#1a7ea5] transition-all">
            <Filter size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Client Info</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Amount</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Transaction Status</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Payment Gateway</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Coverage</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Access</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {payments.map((payment, idx) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#1a7ea5] font-bold group-hover:bg-[#1a7ea5] group-hover:text-white transition-all duration-300">
                          {payment.user.firstName[0]}{payment.user.lastName[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">
                            {payment.user.firstName} {payment.user.lastName}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400">{payment.user.phoneNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-slate-900">{payment.amount.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{payment.currency}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 tracking-tighter shadow-sm">
                        {payment.channel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 leading-tight">{payment.remainingPeriod} days left</span>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1a7ea5] rounded-full" style={{ width: `${(payment.remainingPeriod / payment.subscriptionPeriod) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">of {payment.subscriptionPeriod}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`flex items-center gap-1.5 ${payment.isActive ? "text-emerald-500 font-black" : "text-slate-300 font-bold"} text-xs uppercase tracking-widest`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${payment.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                        {payment.isActive ? "Granted" : "Revoked"}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-[11px] font-medium text-slate-400">
                      {formatDate(payment.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Premium Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900">{payments.length}</span> records
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 disabled:opacity-40 disabled:bg-slate-50 hover:border-[#1a7ea5]/30 hover:text-[#1a7ea5] transition-all shadow-sm"
              >
                Prev
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#1a7ea5] text-white shadow-lg shadow-[#1a7ea5]/20' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 disabled:opacity-40 disabled:bg-slate-50 hover:border-[#1a7ea5]/30 hover:text-[#1a7ea5] transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};