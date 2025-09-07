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

interface PlaceholderProps {
  activeSection: string;
}

export const Placeholder: React.FC<PlaceholderProps> = ({ activeSection }) => {
  const section = sidebarItems.find((item) => item.id === activeSection);
  const Icon = section?.icon;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{section?.label || "Section"}</h1>
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="text-gray-400 mb-4">{Icon && <Icon size={64} />}</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{section?.label}</h3>
        <p className="text-gray-500">
          This section is under development. Content will be added soon.
        </p>
      </div>
    </div>
  );
};
