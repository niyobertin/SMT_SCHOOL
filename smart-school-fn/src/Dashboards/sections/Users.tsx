import { useEffect, useRef, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Toast } from "primereact/toast";
import api from "../../redux/api/api";
import { ConfirmDeleteModal } from "../Modals/ConfirmDeleteModal";

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

  const handleRoleChange = async (id: string, newRole: string) => {
    setUpdatingRoleId(id);
    try {
      await api.patch(`/users/${id}`, { role: newRole });
      toast.current?.show({ severity: "success", summary: "Success", detail: "Role updated successfully" });
      fetchUsers();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to update role" });
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

  const handleVerifyChange = async (id: string, verified: boolean) => {
    try {
      await api.patch(`/users/${id}`, { isVerified: verified });
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `User ${verified ? "verified" : "unverified"} successfully`,
      });
      fetchUsers();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to update verification" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      </div>
      <div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:full lg:w-1/2 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-6">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                        {user.firstName[0]}
                      </div>
                      <div className="ml-4 text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingRoleId === user.id}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="ADMIN">Admin</option>
                        <option value="INSTRUCTOR">Instructor</option>
                      </select>
                    </td>
                    {/* Status toggle */}
                    <td className="px-6 py-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={user.isActive}
                          onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">{user.isActive ? "Active" : "Inactive"}</span>
                      </label>
                    </td>
                    {/* Verified toggle */}
                    <td className="px-6 py-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={user.isVerified}
                          onChange={(e) => handleVerifyChange(user.id, e.target.checked)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">{user.isVerified ? "Yes" : "No"}</span>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        disabled={isDeleteModalOpen}
                      >
                        {isDeleteModalOpen ? "Deleting..." : <><Trash2 size={16} /> Delete</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t border-gray-100">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
      <Toast ref={toast} position="top-right" />
    </div>
  );
};
