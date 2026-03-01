import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { useLogout } from '../../hooks/useLogout';
import { MainHeader } from './MainHeader';
import { motion } from 'framer-motion';
import { fetchOrganizations, setSelectedOrg } from '../../redux/features/examAdminSlice';

export interface NavItem {
    path: string;
    icon: LucideIcon;
    label: string;
    roles?: string[];
}

interface BaseSidebarLayoutProps {
    children: ReactNode;
    navItems: NavItem[];
    portalName: string;
    portalSubtitle?: string;
}

export const BaseSidebarLayout = ({
    children,
    navItems,
    portalName,
    portalSubtitle = "Management Portal"
}: BaseSidebarLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useLogout();
    const dispatch = useAppDispatch();
    const { user, selectedOrganizationId } = useAppSelector((state) => state.auth);
    const { organizations, selectedOrg, loading } = useAppSelector((state) => state.examAdmin);

    useEffect(() => {
        const managementRoles = ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'];
        if (user && managementRoles.includes(user.role) && organizations.length === 0 && !loading) {
            dispatch(fetchOrganizations());
        }
    }, [user, dispatch]);
    useEffect(() => {
        if (organizations && organizations.length > 0) {
            if (selectedOrganizationId) {
                const org = organizations.find(o => (o.id || o.organizationId) === selectedOrganizationId);
                if (org && selectedOrg?.id !== (org.id || org.organizationId)) {
                    dispatch(setSelectedOrg(org));
                }
            } else if (selectedOrg) {
                dispatch(setSelectedOrg(null));
            }
        }
    }, [selectedOrganizationId, organizations, selectedOrg, dispatch]);

    const handleLogout = () => {
        logout();
    };

    const filteredNavItems = navItems.filter(item =>
        !item.roles || (user && (item.roles.includes(user.role) || user.role === 'SUPER_ADMIN'))
    );

    return (
        <div className="h-screen bg-white flex overflow-hidden font-outfit">
            {/* Skip to content link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all font-bold text-sm"
            >
                Skip to content
            </a>

            {/* Sidebar */}
            <aside
                className="w-64 bg-slate-900 text-white flex flex-col h-full flex-shrink-0 shadow-xl z-30"
                aria-label="Sidebar Navigation"
            >
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-bold text-lg leading-tight truncate">{portalName}</h1>
                            <p className="text-[10px] text-slate-400 font-medium truncate">{portalSubtitle}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar" aria-label="Main Navigation">
                    <ul className="space-y-1.5 list-none p-0 m-0">
                        {filteredNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                            return (
                                <li key={item.path}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group relative ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                                        <span className="font-bold text-xs truncate">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-nav-indicator"
                                                className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Toggle / Logout */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all duration-300 border border-red-500/20 font-black text-xs"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
                <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

                {/* Top Header */}
                <MainHeader />

                {/* Content */}
                <main
                    id="main-content"
                    className="flex-1 overflow-y-auto p-8 relative focus:outline-none"
                    tabIndex={-1}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};
