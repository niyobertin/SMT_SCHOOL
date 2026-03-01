import React from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setSelectedOrganization } from '../../redux/features/auth';
import { Building2, ChevronDown } from 'lucide-react';

interface SchoolSelectorProps {
    isLight?: boolean;
}

export const SchoolSelector: React.FC<SchoolSelectorProps> = ({ isLight = false }) => {
    const dispatch = useAppDispatch();
    const { user, selectedOrganizationId } = useAppSelector((state) => state.auth);
    const { organizations: allOrganizations } = useAppSelector((state) => state.examAdmin);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const userOrganizations = user?.userOrganizations || [];

    // For Super Admin, use the global organizations list, otherwise use user's assigned orgs
    const displayOrganizations = isSuperAdmin
        ? allOrganizations
        : userOrganizations.map((uo: any) => uo.organization);

    if (displayOrganizations.length <= 1 && !isSuperAdmin) {
        if (displayOrganizations.length === 1) {
            return (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-800/50 border-slate-700'
                    }`}>
                    <Building2 className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                    <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                        {displayOrganizations[0].name}
                    </span>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="relative group min-w-[200px]">
            <select
                value={selectedOrganizationId || ''}
                onChange={(e) => dispatch(setSelectedOrganization(e.target.value))}
                className={`appearance-none text-sm font-medium py-2 pl-10 pr-8 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer w-full transition-all ${isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                    }`}
            >
                {isSuperAdmin && (
                    <option value="">All Schools</option>
                )}
                {!isSuperAdmin && <option value="" disabled>Select School</option>}

                {displayOrganizations.map((org: any) => (
                    <option key={org.id || org.organizationId} value={org.id || org.organizationId}>
                        {org.name}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Building2 className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
        </div>
    );
};
