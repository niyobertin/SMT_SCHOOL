import { Outlet } from 'react-router-dom';
import { DashboardLayout } from "./layout/DashboardLayout";
import { useState } from 'react';

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <DashboardLayout 
      activeSection={activeSection}
      setActiveSection={setActiveSection}
    >
      <Outlet />
    </DashboardLayout>
  );
};
