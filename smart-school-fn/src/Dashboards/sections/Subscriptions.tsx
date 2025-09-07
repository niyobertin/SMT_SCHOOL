import { Plus, MoreVertical } from "lucide-react";

export const SubscriptionsSection = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Create Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Active Subscriptions</h3>
          <p className="text-3xl font-bold text-green-600">8,429</p>
          <p className="text-sm text-gray-600">+5.2% this month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Cancelled This Month</h3>
          <p className="text-3xl font-bold text-red-600">142</p>
          <p className="text-sm text-gray-600">-2.1% from last month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Monthly Recurring Revenue</h3>
          <p className="text-3xl font-bold text-blue-600">$45,231</p>
          <p className="text-sm text-gray-600">+15.3% this month</p>
        </div>
      </div>

      {/* Plans */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Subscription Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Basic", "Premium", "Enterprise"].map((plan, index) => (
            <div key={plan} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{plan}</h4>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={16} />
                </button>
              </div>
              <p className="text-2xl font-bold mb-1">
                ${[9, 29, 99][index]}
                <span className="text-sm text-gray-500">/month</span>
              </p>
              <p className="text-sm text-gray-600 mb-3">{[2341, 4892, 1196][index]} subscribers</p>
              <button className="w-full py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Manage Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
