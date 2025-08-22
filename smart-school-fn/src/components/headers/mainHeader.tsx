import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Globe } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

export function Header() {
  const { t, language, setLanguage, languages } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const navigationLinks = [
    { href: "/", label: t("home"), exact: true },
    { href: "/courses", label: t("courses") },
    { href: "/programs", label: t("programs") },
    { href: "/tuition", label: t("tuition") },
    { href: "/career", label: t("career") },
    { href: "/news", label: t("news") },
    { href: "/contact", label: t("contactUs") },
  ];

  const isActive = (href: string, exact: boolean = false) => {
    return exact
      ? location.pathname === href
      : location.pathname.startsWith(href);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#5e6af6] bg-clip-text ">
              Smart school
            </h1>
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            {navigationLinks.map(({ href, label, exact = false }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  to={href}
                  className={`${
                    active
                      ? "text-blue-600 font-medium"
                      : "text-gray-700 hover:text-blue-600"
                  } transition-colors`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <Globe className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  {languages.find((lang) => lang.code === language)?.name ||
                    language.toUpperCase()}
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
                      className={`w-full text-left px-4 py-2 text-sm ${
                        language === lang.code
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-[#5e6af6] rounded-md hover:opacity-90 transition-opacity"
              >
                {t("register")}
              </Link>
            </div>

            <button
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationLinks.map(({ href, label, exact = false }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  to={href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("login")}
            </Link>
            <Link
              to="/register"
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-[#5e6af6] hover:opacity-90"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("register")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
