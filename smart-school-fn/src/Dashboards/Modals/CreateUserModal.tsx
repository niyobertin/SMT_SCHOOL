import { useState, useRef } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { Toast } from "primereact/toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../redux/api/api";

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentUserRole: string;
}

interface FormData {
    email: string;
    phoneNumber: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    role: string;
    isActive: boolean;
}

export const CreateUserModal = ({ isOpen, onClose, onSuccess, currentUserRole }: CreateUserModalProps) => {
    const [formData, setFormData] = useState<FormData>({
        email: "",
        phoneNumber: "",
        username: "",
        firstName: "",
        lastName: "",
        password: "",
        role: "STUDENT",
        isActive: true,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const toast = useRef<Toast>(null);

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.email && !formData.phoneNumber) {
            newErrors.email = "Email or phone number is required";
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.username || formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }

        if (!formData.firstName) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName) {
            newErrors.lastName = "Last name is required";
        }

        if (!formData.password || formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        } else {
            if (!/[a-z]/.test(formData.password)) {
                newErrors.password = "Password must contain a lowercase letter";
            } else if (!/[A-Z]/.test(formData.password)) {
                newErrors.password = "Password must contain an uppercase letter";
            } else if (!/\d/.test(formData.password)) {
                newErrors.password = "Password must contain a number";
            } else if (!/[@$!%*?&]/.test(formData.password)) {
                newErrors.password = "Password must contain a special character (@$!%*?&)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.current?.show({
                severity: "error",
                summary: "Validation Error",
                detail: "Please fix the errors in the form",
            });
            return;
        }

        setLoading(true);
        try {
            await api.post("/users", formData);
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "User created successfully and is ready to login",
            });
            onSuccess();
            handleClose();
        } catch (error: any) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: error.response?.data?.message || "Failed to create user",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            email: "",
            phoneNumber: "",
            username: "",
            firstName: "",
            lastName: "",
            password: "",
            role: "STUDENT",
            isActive: true,
        });
        setErrors({});
        setShowPassword(false);
        onClose();
    };

    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: "", color: "" };

        let strength = 0;
        if (password.length >= 6) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/@$!%*?&/.test(password)) strength++;

        if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
        if (strength <= 3) return { strength, label: "Fair", color: "bg-yellow-500" };
        if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
        return { strength, label: "Strong", color: "bg-green-500" };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <>
            <Toast ref={toast} position="top-right" />
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Create New User</h2>
                                    <p className="text-sm text-slate-500 mt-1">Add a new user to the platform</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Email */}
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full px-4 py-3 bg-slate-50 border ${errors.email ? "border-red-300" : "border-slate-200"
                                                } rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 focus:border-[#1a7ea5]/20 transition-all outline-none text-sm font-medium`}
                                            placeholder="user@example.com"
                                        />
                                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                    </div>

                                    {/* Phone Number */}
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 focus:border-[#1a7ea5]/20 transition-all outline-none text-sm font-medium"
                                            placeholder="+250 XXX XXX XXX"
                                        />
                                    </div>

                                    {/* Username */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Username <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className={`w-full px-4 py-3 bg-slate-50 border ${errors.username ? "border-red-300" : "border-slate-200"
                                                } rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 focus:border-[#1a7ea5]/20 transition-all outline-none text-sm font-medium`}
                                            placeholder="johndoe"
                                        />
                                        {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
                                    </div>

                                    {/* First Name */}
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className={`w-full px-4 py-3 bg-slate-50 border ${errors.firstName ? "border-red-300" : "border-slate-200"
                                                } rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 focus:border-[#1a7ea5]/20 transition-all outline-none text-sm font-medium`}
                                            placeholder="John"
                                        />
                                        {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                                    </div>

                                    {/* Last Name */}
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className={`w-full px-4 py-3 bg-slate-50 border ${errors.lastName ? "border-red-300" : "border-slate-200"
                                                } rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 focus:border-[#1a7ea5]/20 transition-all outline-none text-sm font-medium`}
                                            placeholder="Doe"
                                        />
                                        {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                                    </div>

                                    {/* Password */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className={`w-full px-4 py-3 pr-12 bg-slate-50 border ${errors.password ? "border-red-300" : "border-slate-200"
                                                    } rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 focus:border-[#1a7ea5]/20 transition-all outline-none text-sm font-medium`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                                        {formData.password && (
                                            <div className="mt-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${passwordStrength.color} transition-all`}
                                                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">{passwordStrength.label}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Role */}
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Role <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 focus:border-[#1a7ea5]/20 transition-all outline-none text-sm font-medium"
                                        >
                                            <option value="STUDENT">Student</option>
                                            <option value="INSTRUCTOR">Instructor</option>
                                            <option value="EXAMINER">Examiner</option>
                                            <option value="ADMIN">Admin</option>
                                            {currentUserRole === "SUPER_ADMIN" && <option value="SUPER_ADMIN">Super Admin</option>}
                                        </select>
                                    </div>

                                    {/* Active Status */}
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Account Status
                                        </label>
                                        <label className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-5 h-5 text-[#1a7ea5] rounded focus:ring-2 focus:ring-[#1a7ea5]/20"
                                            />
                                            <span className="text-sm font-medium text-slate-700">Active Account</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        {loading ? "Creating..." : "Create User"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
