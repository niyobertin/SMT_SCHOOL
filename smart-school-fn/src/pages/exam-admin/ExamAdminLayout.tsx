import { Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/features/auth';
import { useEffect } from 'react';
import {
    LayoutDashboard,
    Building2,
    Users,
    FileText,
    LogOut,
    Shield,
    ClipboardList,
    PenTool,
} from 'lucide-react';

const ExamAdminLayout = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/exam-admin/login');
        } else if (user?.role !== 'ADMIN' && user?.role !== 'INSTRUCTOR' && user?.role !== 'EXAMINER') {
            navigate('/exam-admin/login');
        }
    }, [isAuthenticated, user, navigate]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/exam-admin/login');
    };

    const navItems = [
        { path: '/exam-admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/exam-admin/organizations', icon: Building2, label: 'Organizations' },
        { path: '/exam-admin/exams', icon: FileText, label: 'Exams' },
        { path: '/exam-admin/candidates', icon: Users, label: 'Candidates' },
        { path: '/exam-admin/marking', icon: PenTool, label: 'Marking' },
        { path: '/exam-admin/results', icon: ClipboardList, label: 'Results' },
    ];

    return (
        <div className="h-screen bg-white flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col h-full flex-shrink-0">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Shield className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Exam Admin</h1>
                            <p className="text-xs text-slate-400">Management Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <li key={item.path}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-slate-300 hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-slate-800">
                    <div className="mb-3 px-2">
                        <p className="text-sm font-semibold text-white truncate">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded">
                            {user?.role}
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-full px-4 md:px-0">
                <Outlet />
            </main>
        </div>
    );
};

export default ExamAdminLayout;
