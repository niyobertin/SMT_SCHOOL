import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchOrganizations,
    fetchDashboardStats,
    setSelectedOrg,
} from '../../redux/features/examAdminSlice';
import DashboardStats from '../../components/exam-admin/DashboardStats';

import {

    Building2,
    ChevronDown,
    Loader2,
} from 'lucide-react';

const Analytics = () => {
    const dispatch = useAppDispatch();
    const { organizations, selectedOrg, dashboardStats, loading } = useAppSelector(
        (state) => state.examAdmin
    );

    useEffect(() => {
        if (selectedOrg) {
            dispatch(fetchDashboardStats(selectedOrg.id));
        }
    }, [selectedOrg, dispatch]);

    useEffect(() => {
        dispatch(fetchOrganizations());
    }, [dispatch]);

    return (
        <div className="p-8">
            {/* Header with Organization Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Overview</h1>
                    <p className="text-gray-600">Monitor organization performance and exam statistics</p>
                </div>

                <div className="relative">
                    <div className="relative inline-block w-full md:w-72">
                        <select
                            value={selectedOrg?.id || ''}
                            onChange={(e) => {
                                const org = organizations.find((o) => o.id === e.target.value);
                                dispatch(setSelectedOrg(org));
                            }}
                            className="appearance-none w-full bg-white border-2 border-gray-200 text-gray-700 py-3 pl-12 pr-10 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium cursor-pointer"
                        >
                            <option value="">Select Organization...</option>
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading analytics data...</p>
                </div>
            ) : dashboardStats ? (
                <DashboardStats stats={dashboardStats} />
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <div className="p-4 bg-gray-50 rounded-full inline-block mb-4">
                        <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Organization</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Please select an organization from the dropdown above to view its analytics dashboard.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Analytics;
