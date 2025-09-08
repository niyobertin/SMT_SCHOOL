import { useState } from "react";
import { DashboardLayout } from "./layout/DashboardLayout";
import { UsersSection } from "./sections/Users";
import { SubscriptionsSection } from "./sections/Subscriptions";
import { Lessons } from "./sections/Lessons";
import { Placeholder } from "./sections/Placeholder";
import { DashboardHome } from "./DashboardHome";
import { CoursesSection } from "./sections/Courses";
import { LessonContent } from "./sections/Content";

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome />;
      case "users":
        return <UsersSection />;
      case "subscriptions":
        return <SubscriptionsSection />;
      case "courses":
        return <CoursesSection setActiveSection={setActiveSection} />;
      case "lessons":
        return <Lessons setActiveSection={setActiveSection} />;
      case "contents":
        return <LessonContent />;
      default:
        return <Placeholder activeSection={activeSection} />;
    }
  };

  return (
    <DashboardLayout activeSection={activeSection} setActiveSection={setActiveSection}>
      {renderContent()}
    </DashboardLayout>
  );
};
