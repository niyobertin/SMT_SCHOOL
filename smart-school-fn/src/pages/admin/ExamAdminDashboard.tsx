import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchOrganizations,
    setSelectedOrg,
    fetchDashboardStats,
} from '../../redux/features/examAdminSlice';
import DashboardStats from '../../components/exam-admin/DashboardStats';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Calendar,
} from 'lucide-react';

const ExamAdminDashboard = () => {
    const dispatch = useAppDispatch();
    const { organizations, selectedOrg, dashboardStats, loading } = useAppSelector(
        (state) => state.examAdmin
    );

    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
    });


    useEffect(() => {
        dispatch(fetchOrganizations());
        // Fetch Global Stats initially (no org, no date)
        dispatch(fetchDashboardStats({}));
    }, [dispatch]);

    useEffect(() => {
        // Re-fetch stats when date changes (globally or for selected org)
        if (dateRange.startDate && dateRange.endDate) {
            dispatch(fetchDashboardStats({
                orgId: selectedOrg?.id,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            }));
        } else {
            // If dates cleared, fetch without dates
            dispatch(fetchDashboardStats({ orgId: selectedOrg?.id }));
        }
    }, [dateRange, selectedOrg, dispatch]);


    const handleSelectOrg = (org: any) => {
        dispatch(setSelectedOrg(org));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };


    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Administration</h1>
                        <p className="text-gray-600">Manage organizations, exams, and candidates</p>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Organization Dropdown */}
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm min-w-[240px]">
                            <BarChart3 className="w-5 h-5 text-gray-500 ml-2" />
                            <select
                                value={selectedOrg?.id || ''}
                                onChange={(e) => {
                                    const org = organizations.find(o => o.id === e.target.value);
                                    handleSelectOrg(org || null);
                                }}
                                className="border-none focus:ring-0 text-sm text-gray-600 bg-transparent w-full cursor-pointer appearance-none pr-8"
                            >
                                <option value="">All Organizations</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range Picker */}
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <Calendar className="w-5 h-5 text-gray-500 ml-2" />
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    name="startDate"
                                    value={dateRange.startDate}
                                    onChange={handleDateChange}
                                    className="border-none focus:ring-0 text-sm text-gray-600"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={dateRange.endDate}
                                    onChange={handleDateChange}
                                    className="border-none focus:ring-0 text-sm text-gray-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Dashboard Stats */}
                {dashboardStats && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {selectedOrg ? `Analytics: ${selectedOrg.name}` : 'Global Overview'}
                        </h2>
                        <DashboardStats stats={dashboardStats} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamAdminDashboard;
