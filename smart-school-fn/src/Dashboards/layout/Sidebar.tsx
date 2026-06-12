import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  FileText,
  Home,
  FileQuestion,
} from "lucide-react";

const managementItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "users", label: "User Management", icon: Users, path: "/dashboard/users" },
  { id: "subscriptions", label: "Subscription Management", icon: CreditCard, path: "/dashboard/subscriptions" },
  { id: "tests", label: "Test Management", icon: FileQuestion, path: "/dashboard/tests" },
  { id: "courses", label: "Course Management", icon: BookOpen, path: "/dashboard/courses" },
  { id: "activity-logs", label: "Activity Logs", icon: Activity, path: "/dashboard/activity-logs" },
  { id: "content", label: "Content Management", icon: FileText, path: "/dashboard/content" },
];

const secondaryItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
}) => {
  const location = useLocation();

  return (
    <div
      className={`${isCollapsed ? "w-20" : "w-72"
        } bg-white border-r border-slate-100 transition-all duration-500 ease-in-out z-40 relative`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 mb-4">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#1a7ea5] rounded-md flex items-center justify-center shadow-lg shadow-[#1a7ea5]/20">
                <img
                  src="/nbglogo.png"
                  alt="Logo"
                  className="h-6 w-auto brightness-200"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-slate-900 capitalize tracking-tighter leading-none">JobExam Rwanda</span>
                <span className="text-[11px] font-medium text-[#6cb9cc] capitalize tracking-widest mt-1">admin</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 rounded-lg transition-all duration-300 ${isCollapsed ? "mx-auto bg-[#1a7ea5]/5" : "hover:bg-slate-50 border border-transparent hover:border-slate-100"}`}
          >
            <div className="flex flex-col gap-1 w-4">
              <div className={`h-0.5 bg-slate-400 rounded-full transition-all duration-300 ${!isCollapsed ? 'w-full' : 'w-4'}`} />
              <div className={`h-0.5 bg-slate-400 rounded-full transition-all duration-300 ${!isCollapsed ? 'w-2/3' : 'w-2'}`} />
              <div className={`h-0.5 bg-slate-400 rounded-full transition-all duration-300 ${!isCollapsed ? 'w-full' : 'w-4'}`} />
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
          {!isCollapsed && (
            <div className="px-2 mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</p>
            </div>
          )}
          <ul className="space-y-1">
            {(() => {
              const userRole = localStorage.getItem("userRole") || "INSTRUCTOR";
              const permissions: Record<string, string[]> = {
                SUPER_ADMIN: ["dashboard", "users", "subscriptions", "tests", "courses", "content", "activity-logs", "home"],
                ADMIN: ["dashboard", "users", "subscriptions", "tests", "courses", "content", "activity-logs", "home"],
                INSTRUCTOR: ["dashboard", "tests", "courses", "content", "home"],
                EXAMINER: ["dashboard", "tests", "home"],
              };
              const allowed = permissions[userRole] || [];
              return allowed;
            })()
              .filter(id => managementItems.some(item => item.id === id))
              .map(id => managementItems.find(item => item.id === id)!)
              .map((item) => {
                const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group ${isActive
                        ? "bg-[#1a7ea5] text-white shadow-lg shadow-[#1a7ea5]/25"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#1a7ea5]"
                        }`}
                    >
                      <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#1a7ea5]"}`}>
                        <item.icon size={20} strokeWidth={2.5} />
                      </div>
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium capitalize tracking-wide truncate">
                          {item.label}
                        </span>
                      )}
                      {isActive && !isCollapsed && (
                        <div className="ml-auto w-1.5 h-1.5 bg-white/40 rounded-full ring-4 ring-white/10" />
                      )}
                    </Link>
                  </li>
                );
              })}
          </ul>

          {/* Section Divider */}
          {!isCollapsed && (
            <div className="border-t border-slate-100 my-3 mx-4" />
          )}

          <ul className="space-y-1">
            {(() => {
              const userRole = localStorage.getItem("userRole") || "INSTRUCTOR";
              const permissions: Record<string, string[]> = {
                SUPER_ADMIN: ["dashboard", "users", "subscriptions", "tests", "courses", "content", "activity-logs", "home"],
                ADMIN: ["dashboard", "users", "subscriptions", "tests", "courses", "content", "activity-logs", "home"],
                INSTRUCTOR: ["dashboard", "tests", "courses", "content", "home"],
                EXAMINER: ["dashboard", "tests", "home"],
              };
              const allowed = permissions[userRole] || [];
              return allowed;
            })()
              .filter(id => secondaryItems.some(item => item.id === id))
              .map(id => secondaryItems.find(item => item.id === id)!)
              .map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group ${isActive
                        ? "bg-[#1a7ea5] text-white shadow-lg shadow-[#1a7ea5]/25"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#1a7ea5]"
                        }`}
                    >
                      <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#1a7ea5]"}`}>
                        <item.icon size={20} strokeWidth={2.5} />
                      </div>
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium capitalize tracking-wide truncate">
                          {item.label}
                        </span>
                      )}
                      {isActive && !isCollapsed && (
                        <div className="ml-auto w-1.5 h-1.5 bg-white/40 rounded-full ring-4 ring-white/10" />
                      )}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="p-6">
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 capitalize tracking-widest mb-2">platform status</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-700 capitalize">healthy</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

