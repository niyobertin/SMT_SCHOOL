import { useEffect, useRef, useState } from "react";
import { Trash2, Shield, UserPlus, Filter, CheckCircle2, XCircle, Building2, Crown, Users, UserCheck, ShieldCheck, UserCog } from "lucide-react";
import { Toast } from "primereact/toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../redux/api/api";
import { ConfirmDeleteModal } from "../Modals/ConfirmDeleteModal";
import { ExaminerAssignmentModal } from "../Modals/ExaminerAssignmentModal";
import { AssignUserToOrgModal } from "../Modals/AssignUserToOrgModal";
import { CreateUserModal } from "../Modals/CreateUserModal";
import Skeleton from "react-loading-skeleton";
import { StatsCard } from "../StatsCard";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  createdAt: string;
  isActive: boolean;
  isVerified: boolean;
}

interface Pagination {
  page: number;
  totalPages: number;
}

export const UsersSection = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1 });
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [isExaminerModalOpen, setIsExaminerModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);

  const [isAssignOrgModalOpen, setIsAssignOrgModalOpen] = useState(false);
  const [selectedUserForOrg, setSelectedUserForOrg] = useState<User | null>(null);

  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const currentUserRole = localStorage.getItem("userRole") || "";

  const toast = useRef<Toast>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users", {
        params: { page, limit: 10, q: debouncedSearch },
      });
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to fetch users" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, page]);

  // Derive stats from current view for UI consistency
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const admins = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length;
  const instructors = users.filter(u => u.role === 'INSTRUCTOR').length;

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/users/${deleteId}`);
      toast.current?.show({ severity: "success", summary: "Success", detail: "User deleted successfully" });
      fetchUsers();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to delete user" });
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const handleRoleChange = async (user: User, newRole: string) => {
    if (newRole === 'EXAMINER') {
      setSelectedUserForRole(user);
      setIsExaminerModalOpen(true);
      return;
    }

    setUpdatingRoleId(user.id);
    try {
      await api.patch(`/users/${user.id}/role`, { role: newRole });
      toast.current?.show({ severity: "success", summary: "Success", detail: "Role updated successfully" });
      fetchUsers();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to update role" });
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const confirmExaminerAssignment = async (orgIds: string[]) => {
    if (!selectedUserForRole) return;
    setUpdatingRoleId(selectedUserForRole.id);

    try {
      await api.post(`/users/${selectedUserForRole.id}/assign-examiner-role`, {
        organizationIds: orgIds
      });
      toast.current?.show({ severity: "success", summary: "Success", detail: "Examiner role assigned successfully" });
      fetchUsers();
      setIsExaminerModalOpen(false);
      setSelectedUserForRole(null);
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to assign examiner role" });
      console.error(error);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleStatusChange = async (id: string, active: boolean) => {
    try {
      await api.patch(`/users/${id}`, { isActive: active });
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `User ${active ? "activated" : "deactivated"} successfully`,
      });
      fetchUsers();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to update status" });
    }
  };


  const handleManageOrganizations = (user: User) => {
    setSelectedUserForRole(user);
    setIsExaminerModalOpen(true);
  };

  const handleAssignToOrg = (user: User) => {
    setSelectedUserForOrg(user);
    setIsAssignOrgModalOpen(true);
  };

  const handleAssignToOrgSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Success", detail: "User assigned to organization successfully" });
    fetchUsers();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-0"
    >
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Users</h1>
          <p className="text-slate-500 font-medium mt-3">Manage your platform's community and access levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateUserModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20"
          >
            <UserPlus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* High-Level Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          color="bg-blue-500"
          change="Community"
        />
        <StatsCard
          title="Active Now"
          value={activeUsers}
          icon={UserCheck}
          color="bg-emerald-500"
          change="Status"
        />
        <StatsCard
          title="Administrators"
          value={admins}
          icon={ShieldCheck}
          color="bg-purple-500"
          change="Access"
        />
        <StatsCard
          title="Instructors"
          value={instructors}
          icon={UserCog}
          color="bg-amber-500"
          change="Faculty"
        />
      </div>


      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder="Search by name, username or email..."
            className="w-full px-6 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 focus:border-[#1a7ea5]/20 transition-all outline-none text-sm font-medium text-slate-700 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">User Identity</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Account Role</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Verified</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={5} className="px-8 py-4">
                      <Skeleton height={40} borderRadius={12} />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium">No system users found.</td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {users.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm border shadow-inner ${user.role === 'SUPER_ADMIN'
                            ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white border-amber-300'
                            : 'bg-[#1a7ea5]/10 text-[#1a7ea5] border-[#1a7ea5]/5'
                            }`}>
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-[#1a7ea5] transition-colors">{user.firstName} {user.lastName}</span>
                              {user.role === 'SUPER_ADMIN' && (
                                <Crown size={12} className="text-amber-600 fill-amber-600" />
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            disabled={updatingRoleId === user.id}
                            className={`appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:ring-4 focus:ring-[#1a7ea5]/5 focus:border-[#1a7ea5]/30 outline-none transition-all cursor-pointer ${user.role === 'SUPER_ADMIN' ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border-amber-300' :
                              user.role === 'EXAMINER' ? 'bg-purple-100/50 text-purple-700 border-purple-200' : ''
                              }`}
                          >
                            <option value="STUDENT">Student</option>
                            <option value="ADMIN">Admin</option>
                            <option value="INSTRUCTOR">Instructor</option>
                            <option value="EXAMINER">Examiner</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>
                          {user.role === 'SUPER_ADMIN' && (
                            <div className="p-2 text-amber-600 bg-amber-50 rounded-xl" title="System Owner">
                              <Crown size={14} className="fill-amber-600" />
                            </div>
                          )}
                          {user.role === 'EXAMINER' && (
                            <button
                              onClick={() => handleManageOrganizations(user)}
                              className="p-2 text-purple-600 hover:bg-purple-600 hover:text-white rounded-xl transition-all"
                              title="Manage Organizations"
                            >
                              <Shield size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleStatusChange(user.id, !user.isActive)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${user.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}
                        >
                          <div className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                          {user.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {user.isVerified ? (
                            <CheckCircle2 size={18} className="text-emerald-500" />
                          ) : (
                            <XCircle size={18} className="text-slate-300" />
                          )}
                          <span className="text-xs font-bold text-slate-500">{user.isVerified ? "Verified" : "Pending"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 transition-opacity">
                          <button
                            onClick={() => handleAssignToOrg(user)}
                            className="p-2.5 text-slate-500 hover:text-[#1a7ea5] bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-sm"
                            title="Assign to organization"
                          >
                            <Building2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2.5 text-slate-500 hover:text-red-500 bg-white hover:bg-red-50 border border-slate-100 hover:border-red-100 rounded-xl transition-all shadow-sm"
                            disabled={isDeleteModalOpen}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Premium Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-8 py-6 bg-slate-50/30 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{users.length}</span> results per page
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 disabled:opacity-40 disabled:bg-slate-50 hover:border-[#1a7ea5]/30 hover:text-[#1a7ea5] transition-all shadow-sm"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-[#1a7ea5] text-white shadow-lg shadow-[#1a7ea5]/20' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 disabled:opacity-40 disabled:bg-slate-50 hover:border-[#1a7ea5]/30 hover:text-[#1a7ea5] transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove User"
        message="This will permanently revoke all access for this user. Are you absolutely sure?"
      />

      {
        selectedUserForRole && (
          <ExaminerAssignmentModal
            isOpen={isExaminerModalOpen}
            onClose={() => {
              setIsExaminerModalOpen(false);
              setSelectedUserForRole(null);
            }}
            onConfirm={confirmExaminerAssignment}
            userId={selectedUserForRole.id}
            loading={!!updatingRoleId}
          />
        )
      }

      {
        selectedUserForOrg && (
          <AssignUserToOrgModal
            isOpen={isAssignOrgModalOpen}
            onClose={() => {
              setIsAssignOrgModalOpen(false);
              setSelectedUserForOrg(null);
            }}
            onSuccess={handleAssignToOrgSuccess}
            onError={(message) => toast.current?.show({ severity: "error", summary: "Error", detail: message })}
            userId={selectedUserForOrg.id}
            userName={`${selectedUserForOrg.firstName} ${selectedUserForOrg.lastName}`}
          />
        )
      }

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
          setIsCreateUserModalOpen(false);
        }}
        currentUserRole={currentUserRole}
      />

      <Toast ref={toast} position="top-right" />
    </motion.div >
  );
};

