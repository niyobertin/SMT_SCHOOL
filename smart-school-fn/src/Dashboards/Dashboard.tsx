import { Outlet } from 'react-router-dom';
import { DashboardLayout } from "./layout/DashboardLayout";

export const Dashboard = () => {
  return (
    <DashboardLayout 
      children={<Outlet />}
    />
  );
};
