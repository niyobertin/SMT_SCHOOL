import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchDashboardStats,
} from '../../redux/features/examAdminSlice';
import DashboardStats from '../../components/exam-admin/DashboardStats';
import {
    BarChart3,
    Calendar,
    Loader2,
} from 'lucide-react';

const ExamAdminDashboard = () => {
    const dispatch = useAppDispatch();
    const { dashboardStats, loading } = useAppSelector(
        (state) => state.examAdmin
    );
    const { selectedOrganizationId, user: authUser } = useAppSelector((state) => state.auth);

    const selectedOrg = authUser?.userOrganizations?.find(
        (uo: any) => uo.organizationId === selectedOrganizationId
    )?.organization;

    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
    });


    useEffect(() => {
        // Fetch dashboard stats whenever the selected organization changes or date range changes
        dispatch(fetchDashboardStats({
            orgId: selectedOrganizationId || undefined,
            startDate: dateRange.startDate || undefined,
            endDate: dateRange.endDate || undefined
        }));
    }, [dispatch, selectedOrganizationId, dateRange.startDate, dateRange.endDate]);


    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };


    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Administration</h1>
                        <p className="text-gray-600">Manage organizations, exams, and candidates</p>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Date Range Picker */}
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <Calendar className="w-5 h-5 text-gray-500 ml-2" />
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    name="startDate"
                                    value={dateRange.startDate}
                                    onChange={handleDateChange}
                                    className="border-none focus:ring-0 text-sm text-gray-600 outline-none"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={dateRange.endDate}
                                    onChange={handleDateChange}
                                    className="border-none focus:ring-0 text-sm text-gray-600 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Dashboard Stats */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium text-lg">Loading dashboard overview...</p>
                    </div>
                ) : dashboardStats ? (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" />
                            {selectedOrg ? `Analytics: ${selectedOrg.name}` : 'Global Overview'}
                        </h2>
                        <DashboardStats stats={dashboardStats} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};


export default ExamAdminDashboard;
