import { Users, CreditCard, BookOpen, DollarSign, TrendingUp, UserCheck } from "lucide-react";

export const DashboardHome = () => {
  const stats = [
    { title: "Total Users", value: "12,543", change: "+12%", icon: Users, color: "bg-blue-500" },
    { title: "Active Subscriptions", value: "8,429", change: "+8%", icon: CreditCard, color: "bg-green-500" },
    { title: "Total Courses", value: "156", change: "+3%", icon: BookOpen, color: "bg-purple-500" },
    { title: "Monthly Revenue", value: "$45,231", change: "+15%", icon: DollarSign, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.users}
          icon={Users}
          color="bg-blue-500"
        />
        <StatsCard
          title="Total Courses"
          value={stats.courses}
          icon={BookOpen}
          color="bg-purple-500"
        />
        <StatsCard
          title="Active Enrollments"
          value={stats.enrollments}
          icon={CreditCard}
          color="bg-green-500"
        />
        <StatsCard
          title="Total Revenue"
          value={`RWF ${totalRevenue.toLocaleString()
            }`}
          icon={DollarSign}
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Trend</h2>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
          <Activity className="text-gray-400" />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          <div className="h-48 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp size={48} className="text-blue-500 mx-auto mb-2" />
              <p className="text-gray-600">Chart visualization would go here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
