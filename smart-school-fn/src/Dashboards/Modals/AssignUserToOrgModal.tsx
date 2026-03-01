import React, { useEffect, useState } from "react";
import api from "../../redux/api/api";

type AssignUserToOrgModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onError?: (message: string) => void;
    userId: string;
    userName: string;
};

interface Organization {
    id: string;
    name: string;
}

export const AssignUserToOrgModal: React.FC<AssignUserToOrgModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onError,
    userId,
    userName,
}) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedOrgId("");
            fetchOrganizations();
        }
    }, [isOpen]);

    const fetchOrganizations = async () => {
        setFetchLoading(true);
        try {
            const response = await api.get("/exams/organizations");
            setOrganizations(response.data.data || response.data || []);
        } catch (error) {
            console.error("Failed to fetch organizations", error);
        } finally {
            setFetchLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedOrgId) return;
        setLoading(true);
        try {
            await api.post(`/users/${userId}/organizations/${selectedOrgId}`);
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to assign user to organization";
            onError?.(message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700/70 backdrop-blur-sm z-50">
            <div className="bg-white p-4 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-lg font-bold mb-0.5">Assign User to Organization</h2>
                <p className="text-sm text-gray-600 mb-2">
                    Add <span className="font-medium text-slate-800">{userName}</span> to an organization. They will have access to that organization's exams (e.g. as Examiner/Instructor).
                </p>

                <div className="mb-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
                    {fetchLoading ? (
                        <div className="py-4 text-center text-slate-500 text-sm">Loading organizations...</div>
                    ) : organizations.length === 0 ? (
                        <div className="py-4 text-center text-slate-500 text-sm">No organizations found</div>
                    ) : (
                        <select
                            value={selectedOrgId}
                            onChange={(e) => setSelectedOrgId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#1a7ea5]/20 focus:border-[#1a7ea5] outline-none"
                        >
                            <option value="">Select organization...</option>
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAssign}
                        disabled={!selectedOrgId || loading || fetchLoading}
                        className="px-3 py-1.5 bg-[#1a7ea5] text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Assigning..." : "Assign"}
                    </button>
                </div>
            </div>
        </div>
    );
};
