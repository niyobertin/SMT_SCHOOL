import React, { useEffect, useState } from "react";
import api from "../../redux/api/api";
import { Toast } from "primereact/toast";

type ExaminerAssignmentModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (orgIds: string[]) => void;
    userId: string;
    loading?: boolean;
};

interface Organization {
    id: string;
    name: string;
}

export const ExaminerAssignmentModal: React.FC<ExaminerAssignmentModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    userId,
    loading = false,
}) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchOrganizations();
            // Optionally fetch existing assignments if the user is already an examiner
            // But for role change, assume start fresh or maybe we should fetch if user.role is ALREADY examiner?
            // Since this modal is triggered on role change, we'll start with empty or maybe we should fetch.
            // For now, let's keep it simple: user selects organizations to assign.
        } else {
            setSelectedOrgs([]);
        }
    }, [isOpen]);

    const fetchOrganizations = async () => {
        setFetchLoading(true);
        try {
            const response = await api.get("/exams/organizations");
            // Adjust depending on actual API structure. usually response.data.data or response.data
            setOrganizations(response.data.data || []);

            // If updating existing examiner, fetching their current orgs would be good.
            // Try to fetch current assigments
            fetchUserOrganizations();
        } catch (error) {
            console.error("Failed to fetch organizations", error);
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchUserOrganizations = async () => {
        try {
            const response = await api.get(`/users/${userId}/organizations`);
            // Assuming response returns array of organization IDs or objects
            const userOrgs = response.data.data || [];
            // If it returns UserOrganization[], map to orgId
            const orgIds = userOrgs.map((uo: any) => typeof uo === 'string' ? uo : uo.organizationId || uo.id);
            setSelectedOrgs(orgIds);
        } catch (error) {
            // Ignore if 404 or fails - assumes no orgs
        }
    }

    const toggleOrg = (id: string) => {
        setSelectedOrgs((prev) =>
            prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700/70 backdrop-blur-sm z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
                <h2 className="text-lg font-bold mb-2">Assign Organizations</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Select the organizations this examiner will manage.
                </p>

                <div className="flex-1 overflow-y-auto border border-gray-200 rounded p-2 mb-4">
                    {fetchLoading ? (
                        <div className="text-center py-4">Loading organizations...</div>
                    ) : organizations.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No organizations found</div>
                    ) : (
                        <div className="space-y-2">
                            {organizations.map((org) => (
                                <label key={org.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrgs.includes(org.id)}
                                        onChange={() => toggleOrg(org.id)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 font-medium">{org.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(selectedOrgs)}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Confirm Assignment'}
                    </button>
                </div>
            </div>
        </div>
    );
};
