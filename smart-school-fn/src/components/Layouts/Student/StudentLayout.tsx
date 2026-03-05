import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    User,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronRight,
    Search,
    Shield,
    BarChart3,
    Calendar,
    FileQuestion,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import { setSelectedAcademicYear } from "../../../redux/features/studentAuth";
import { fetchAcademicYears } from "../../../redux/features/academic/academicSlice";
import { YearSelectionModal } from "../../Modals/YearSelectionModal";

export const StudentLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [showYearModal, setShowYearModal] = useState(false);
    const [academicYears, setAcademicYears] = useState<any[]>([]);

    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { selectedAcademicYear } = useAppSelector((state) => state.studentAuth);

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchProfile();
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (profile && !selectedAcademicYear && !showYearModal) {
            handleOpenYearModal();
        }
    }, [profile, selectedAcademicYear]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("accessToken_student");
            if (!token) return;

            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/student-auth/me`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setProfile(data.data);
        } catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken_student");
        localStorage.removeItem("student");
        localStorage.removeItem("selectedAcademicYear");
        navigate("/login");
    };

    const handleOpenYearModal = async () => {
        if (profile?.schoolId) {
            const result = await dispatch(fetchAcademicYears(profile.schoolId));
            if (fetchAcademicYears.fulfilled.match(result)) {
                setAcademicYears(result.payload);
                setShowYearModal(true);
            }
        }
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
        { icon: BookOpen, label: "My Courses", path: "/student/courses" },
        { icon: FileQuestion, label: "Take Test", path: "/student/available-tests" },
        { icon: BarChart3, label: "My Results", path: "/student/results" },
        { icon: User, label: "Profile", path: "/profile" },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-outfit">
            {/* Sidebar - Desktop */}
            <aside
                className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"
                    } relative z-30`}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <Link to="/" className="flex items-center gap-3 overflow-hidden">
                        <div className="w-6 h-6 bg-[#1a7ea5] rounded-md flex items-center justify-center flex-shrink-0">
                            <Shield className="text-white w-5 h-5" />
                        </div>
                        {isSidebarOpen && (
                            <span className="font-semibold text-xl text-gray-800 whitespace-nowrap capitalize">
                                smt school
                            </span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-3 px-2 space-y-0.5">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group ${isActive
                                    ? "bg-[#1a7ea5] text-white shadow-md shadow-[#1a7ea5]/20"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-[#1a7ea5]"
                                    }`}
                            >
                                <Icon
                                    className={`flex-shrink-0 w-5 h-5 ${isActive ? "text-white" : "group-hover:text-[#1a7ea5]"
                                        }`}
                                />
                                {isSidebarOpen && (
                                    <span className="font-medium text-[15px] capitalize">{item.label}</span>
                                )}
                                {isSidebarOpen && isActive && (
                                    <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Summary & Logout */}
                <div className="p-4 border-t border-gray-100">
                    {isSidebarOpen && profile && (
                        <div className="mb-2 px-1.5 py-2 bg-gray-50 rounded-lg">
                            <p className="text-[11px] font-semibold text-gray-400 capitalize tracking-tight mb-1">
                                student
                            </p>
                            <p className="text-sm font-semibold text-gray-800 truncate">
                                {profile.firstName} {profile.lastName}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">{profile.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all ${!isSidebarOpen && "justify-center"
                            }`}
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="font-medium text-[15px] capitalize">logout</span>}
                    </button>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-40"
                >
                    <ChevronRight
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#1a7ea5] focus:bg-white transition-all w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>

                        <div className="h-8 w-px bg-gray-200 mx-1" />

                        {/* Academic Year Selector */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleOpenYearModal}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all group"
                            >
                                <Calendar size={14} className="text-[#1a7ea5]" />
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                        Academic Year
                                    </p>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">
                                        {selectedAcademicYear?.year || "Select Year"}
                                    </p>
                                </div>
                            </button>
                        </div>

                        <div className="h-8 w-px bg-gray-200 mx-1" />

                        <div className="flex items-center gap-3">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-gray-800">
                                    {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : "Student"}
                                </p>
                                <p className="text-[11px] text-gray-500 capitalize font-medium tracking-widest">
                                    level 1 student
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1a7ea5] to-[#6cb9cc] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {profile?.firstName?.[0] || <User className="w-5 h-5" />}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-3 md:p-4">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden flex flex-col"
                        >
                            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#1a7ea5] rounded-lg flex items-center justify-center">
                                        <Shield className="text-white w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-lg text-gray-800 capitalize">
                                        smt school
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 py-6 px-4 space-y-2">
                                {menuItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${isActive
                                                ? "bg-[#1a7ea5] text-white"
                                                : "text-gray-500 hover:bg-gray-50"
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-semibold capitalize">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="p-6 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all font-semibold"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="capitalize">logout</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showYearModal && (
                    <YearSelectionModal
                        years={academicYears}
                        selectedYearId={selectedAcademicYear?.id}
                        onSelect={(year) => {
                            dispatch(setSelectedAcademicYear(year));
                            setShowYearModal(false);
                            // Optionally refresh data based on new year
                            window.location.reload();
                        }}
                        onClose={() => setShowYearModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
