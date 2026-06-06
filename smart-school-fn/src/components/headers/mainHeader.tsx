import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, User, LogOut, LayoutDashboard, Loader2, Shield } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/stores";
import { fetchCurrentUser, logout as logoutAction } from "../../redux/features/auth";
import { useLanguage } from "../../hooks/useLanguage";
import Logo from "../../assets/logo.jpg";

export function Header() {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { user, loading: loadingUser } = useSelector((state: RootState) => state.auth);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  const logout = () => {
    dispatch(logoutAction());
    navigate("/");
  };
  const navigationLinks = [
    { href: "/", label: t("home"), exact: true },
    { href: "/about", label: t("aboutUs") },
    { href: "/courses", label: t("courses") },
    { href: "/tuition", label: t("tuition") },
    { href: "/job-listing", label: "Jobs" },
    { href: "/contact", label: t("contactUs") },
    { href: "/certificates", label: "Certificates" },
  ];

  const isActive = (href: string, exact: boolean = false) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group transition-all py-2 min-h-[44px]" aria-label="Smart school Home">
            <img src={Logo} alt="Logo" className="w-8 h-8 md:w-9 md:h-9 rounded-sm shadow-sm group-hover:scale-105 transition-transform" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#1a7ea5]">Smart school</h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 whitespace-nowrap" aria-label="Main navigation">
            {navigationLinks.map(({ href, label, exact = false }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  to={href}
                  className={`px-3 py-3 text-[14px] tracking-wider min-h-[44px] flex items-center ${active ? "text-[#1a7ea5] font-semibold" : "text-gray-500 hover:text-[#1a7ea5]"} transition-colors relative group rounded-lg hover:bg-slate-50`}
                >
                  {label}
                  <span className={`absolute bottom-0 left-2 right-2 h-[2px] bg-[#1a7ea5] transition-transform duration-300 origin-left ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </Link>
              );
            })}

            {/* Exam Portal Link */}
            <Link
              to="/exam-portal/login"
              className="px-3 py-3 text-[14px] tracking-wider text-gray-500 hover:text-[#1a7ea5] transition-colors min-h-[44px] flex items-center rounded-lg hover:bg-slate-50"
            >
              {t("examPortal")}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* User section */}
            {loadingUser ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="animate-spin w-5 h-5 text-gray-400" />
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown((v) => !v)}
                  className="flex items-center gap-2 text-white bg-gradient-to-r from-[#1a7ea5] to-[#6cb9cc] hover:shadow-md transition-all px-4 py-2.5 min-h-[44px] rounded-full cursor-pointer"
                >
                  <User size={16} />
                  <span className="hidden sm:inline text-[14px] font-medium">{user?.firstName}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showUserDropdown && (
                  <div
                    className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-1 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-[#6cb9cc]/10 hover:text-[#1a7ea5] transition-colors">
                      <User size={14} /> {t("profile")}
                    </Link>
                    {user.role !== "EXAMINER" && (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "INSTRUCTOR") && (
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-[#6cb9cc]/10 hover:text-[#1a7ea5] transition-colors">
                        <LayoutDashboard size={14} /> {t("dashboard")}
                      </Link>
                    )}
                    {(user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "INSTRUCTOR" || user.role === "EXAMINER") && (
                      <Link to="/exam-admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-[#6cb9cc]/10 hover:text-[#1a7ea5] transition-colors">
                        <Shield size={14} /> {t("examinationPortal")}
                      </Link>
                    )}
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link to="/login" className="px-4 py-2.5 min-h-[44px] flex items-center text-[13px] font-semibold uppercase tracking-wider text-gray-500 hover:text-[#1a7ea5] transition-colors rounded-lg hover:bg-slate-50">
                  {t("login")}
                </Link>
                <Link to="/register" className="px-6 py-2.5 min-h-[44px] flex items-center text-[13px] font-semibold uppercase tracking-wider text-white bg-[#1a7ea5] rounded-full hover:bg-[#156d8f] shadow-sm hover:shadow-md transition-all">
                  {t("register")}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-[#1a7ea5] hover:bg-gray-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navigationLinks.map(({ href, label, exact = false }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  to={href}
                  className={`block px-3 py-2.5 rounded-lg text-[13px] font-semibold tracking-wider ${active ? "bg-[#6cb9cc]/10 text-[#1a7ea5]" : "text-gray-500 hover:bg-gray-50"}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}

            {/* Mobile Exam Portal */}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("examPortal")}</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/exam-admin/login" className="flex items-center justify-center p-2 rounded-lg text-center text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Examiner
                </Link>
                <Link to="/exam-portal/login" className="flex items-center justify-center p-2 rounded-lg text-center text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Candidate
                </Link>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              {!user ? (
                <>
                  <Link to="/login" className="flex items-center justify-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                    {t("login")}
                  </Link>
                  <Link to="/register" className="flex items-center justify-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[#1a7ea5]" onClick={() => setIsMobileMenuOpen(false)}>
                    {t("register")}
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-red-500 bg-red-50"
                >
                  <LogOut size={14} /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
