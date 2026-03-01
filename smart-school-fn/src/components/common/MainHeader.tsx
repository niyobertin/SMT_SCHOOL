import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { useLogout } from '../../hooks/useLogout';
import { SchoolSelector } from './SchoolSelector';
import { LogOut, User, Bell, Search, Settings } from 'lucide-react';
import { useState } from 'react';

export const MainHeader = () => {
    const navigate = useNavigate();
    const logout = useLogout();
    const { user } = useAppSelector((state) => state.auth);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between">
            {/* Search / Breadcrumbs Area */}
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full bg-slate-100/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
                {/* School Selector */}
                <div className="min-w-[200px]">
                    <SchoolSelector isLight={true} />
                </div>

                {/* Notifications */}
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User className="w-4 h-4" />
                            )}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-sm font-semibold text-slate-900 leading-none">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                                {user?.role}
                            </p>
                        </div>
                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="px-4 py-3 border-b border-slate-50">
                                    <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <User className="w-4 h-4 text-slate-400" />
                                        Profile Settings
                                    </button>
                                    <button
                                        onClick={() => { navigate('/settings'); setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <Settings className="w-4 h-4 text-slate-400" />
                                        Platform Settings
                                    </button>
                                </div>
                                <div className="border-t border-slate-50 pt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
