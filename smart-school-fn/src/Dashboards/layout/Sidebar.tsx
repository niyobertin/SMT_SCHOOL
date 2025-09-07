import React from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  BarChart3,
  FileText,
  Bell,
  Shield,
  Settings,
  HelpCircle,
} from "lucide-react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "subscriptions", label: "Subscription Management", icon: CreditCard },
  { id: "courses", label: "Course Management", icon: BookOpen },
  { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
  { id: "content", label: "Content Management", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security & Permissions", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "support", label: "Help & Support", icon: HelpCircle },
];

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  isCollapsed,
  setIsCollapsed,
}) => {
  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-white border-r border-gray-200 transition-all duration-300`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <LayoutDashboard size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={20} />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">AD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
