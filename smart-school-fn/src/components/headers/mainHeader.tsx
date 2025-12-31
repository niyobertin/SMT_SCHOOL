import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, User, LogOut, LayoutDashboard, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/stores";
import { fetchCurrentUser, logout as logoutAction } from "../../redux/features/auth";
import { useLanguage } from "../../hooks/useLanguage";
import Logo from "../../assets/logo.jpg";

export function Header() {
  const { t } = useLanguage();
  // language, setLanguage, languages
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showExamDropdown, setShowExamDropdown] = useState(false);

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
  ];

  const isActive = (href: string, exact: boolean = false) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={Logo} alt="Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-[#5e6af6]">Smart school</h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigationLinks.map(({ href, label, exact = false }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  to={href}
                  className={`${active ? "text-blue-600 font-medium" : "text-gray-700 hover:text-blue-600"} transition-colors`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Exam Portal Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExamDropdown(!showExamDropdown)}
                onMouseEnter={() => setShowExamDropdown(true)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors py-2"
              >
                {t("examPortal")}
                <ChevronDown className={`h-4 w-4 transition-transform ${showExamDropdown ? "rotate-180" : ""}`} />
              </button>

              {showExamDropdown && (
                <div
                  className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
                  onMouseLeave={() => setShowExamDropdown(false)}
                >
                  <Link
                    to="/exam-admin/login"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setShowExamDropdown(false)}
                  >
                    {t("joinAsExaminer")}
                  </Link>
                  <Link
                    to="/exam-portal/login"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setShowExamDropdown(false)}
                  >
                    {t("joinAsCandidate")}
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Language selector */}
            {/* <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <Globe className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  {languages.find((l) => l.code === language)?.name || language.toUpperCase()}
                </span>
              </button>

              {showLanguageDropdown && (
                <div
                  className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
                  onMouseLeave={() => setShowLanguageDropdown(false)}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2  text-sm ${language === lang.code ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div> */}

            {/* User section */}
            {loadingUser ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="animate-spin w-6 h-6 text-gray-700" />
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown((v) => !v)}
                  className="flex items-center gap-2 text-white bg-gradient-to-r from-blue-500 to-indigo-500 transition-colors hover:bg-gray-100 p-2 rounded-full cursor-pointer"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showUserDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-base text-gray-700 hover:bg-gray-200">
                      <User className="h-4 w-4" /> {t("profile")}
                    </Link>
                    {(user.role === "ADMIN" || user.role === "INSTRUCTOR") && (
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-base text-gray-700 hover:bg-gray-200">
                        <LayoutDashboard className="h-4 w-4" /> {t("dashboard")}
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-base text-gray-700 hover:bg-gray-200"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  {t("login")}
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-[#5e6af6] rounded-md hover:opacity-90 transition-opacity">
                  {t("register")}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationLinks.map(({ href, label, exact = false }) => {
              const active = isActive(href, exact);
              return (
                <Link key={href} to={href} className={`block px-3 py-2 rounded-md text-base font-medium ${active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`} onClick={() => setIsMobileMenuOpen(false)}>
                  {label}
                </Link>
              );
            })}

            {/* Mobile Exam Portal */}
            <div className="border-t border-gray-100 my-1 pt-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t("examPortal")}
              </div>
              <Link to="/exam-admin/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                {t("joinAsExaminer")}
              </Link>
              <Link to="/exam-portal/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                {t("joinAsCandidate")}
              </Link>
            </div>

            {loadingUser ? (
              <div className="flex justify-center py-2">
                <Loader2 className="animate-spin w-6 h-6 text-gray-700" />
              </div>
            ) : !user ? (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                  {t("login")}
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-[#5e6af6] hover:opacity-90" onClick={() => setIsMobileMenuOpen(false)}>
                  {t("register")}
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                  {t("profile")}
                </Link>
                {(user.role === "ADMIN" || user.role === "INSTRUCTOR") && (
                  <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                    {t("dashboard")}
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
