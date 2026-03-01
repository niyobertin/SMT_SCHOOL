import { useState, useRef } from "react";
import { X, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Toast } from "primereact/toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createStudent } from "../../redux/features/examAdminSlice";

interface CreateStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organizationId: string;
    gradeId?: string;
    classId?: string;
    yearId?: string;
}

interface FormData {
    email?: string;
    phoneNumber?: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    studentCode: string;
    gradeId: string;
    classId: string;
    yearId: string;
}

export const CreateStudentModal = ({ isOpen, onClose, onSuccess, organizationId }: CreateStudentModalProps) => {
    const dispatch = useAppDispatch();
    const { grades, academicYears } = useAppSelector((state) => state.examAdmin);
    const [formData, setFormData] = useState<FormData>({
        email: "",
        phoneNumber: "",
        username: "",
        firstName: "",
        lastName: "",
        password: "",
        studentCode: "",
        gradeId: "",
        classId: "",
        yearId: academicYears.find(y => y.isActive)?.id || "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const toast = useRef<Toast>(null);

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

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
        }

        if (!formData.studentCode || formData.studentCode.trim().length === 0) {
            newErrors.studentCode = "Student Code is required";
        }

        if (!formData.gradeId) {
            newErrors.gradeId = "Grade is required";
        }

        if (!formData.yearId) {
            newErrors.yearId = "Academic year is required";
        }

        // Email is optional – only validate format when provided
        if (formData.email && formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                newErrors.email = "Enter a valid email address";
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
            await dispatch(createStudent({
                ...formData,
                organizationId,
                classId,
                yearId,
                studentCode: formData.studentCode
            })).unwrap();

            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Student created and linked to school successfully",
            });
            onSuccess();
            handleClose();
        } catch (error: any) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: error || "Failed to create student",
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
            studentCode: "",
            gradeId: "",
            classId: "",
            yearId: academicYears.find(y => y.isActive)?.id || "",
        });
        setErrors({});
        setShowPassword(false);
        onClose();
    };

    return (
        <>
            <Toast ref={toast} position="top-right" />
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                        <UserPlus className="w-5 h-5 text-indigo-600" />
                                        Quick Add Student
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">Add a school-based student account</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className={`w-full px-4 py-2 bg-slate-50 border ${errors.firstName ? "border-red-300" : "border-slate-200"} rounded-xl outline-none font-bold text-sm`}
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className={`w-full px-4 py-2 bg-slate-50 border ${errors.lastName ? "border-red-300" : "border-slate-200"} rounded-xl outline-none font-bold text-sm`}
                                            placeholder="Doe"
                                        />
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Username</label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className={`w-full px-4 py-2 bg-slate-50 border ${errors.username ? "border-red-300" : "border-slate-200"} rounded-xl outline-none font-bold text-sm`}
                                            placeholder="johndoe123"
                                        />
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Student Code</label>
                                        <input
                                            type="text"
                                            value={formData.studentCode}
                                            onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                                            className={`w-full px-4 py-2 bg-slate-50 border ${errors.studentCode ? "border-red-300" : "border-slate-200"} rounded-xl outline-none font-bold text-sm`}
                                            placeholder="STU-2024-001"
                                        />
                                        {errors.studentCode && (
                                            <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.studentCode}</p>
                                        )}
                                    </div>

                                    <div className="col-span-2 pt-2 pb-1">
                                        <hr className="border-slate-100" />
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight italic">Academic Placement</p>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Grade</label>
                                        <select
                                            value={formData.gradeId}
                                            onChange={(e) => setFormData({ ...formData, gradeId: e.target.value, classId: "" })}
                                            className={`w-full px-4 py-2 bg-slate-50 border ${errors.gradeId ? "border-red-300" : "border-slate-200"} rounded-xl outline-none font-bold text-sm bg-white`}
                                        >
                                            <option value="">Select Grade</option>
                                            {grades.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Class (Optional)</label>
                                        <select
                                            value={formData.classId}
                                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                            disabled={!formData.gradeId}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm bg-white disabled:opacity-50"
                                        >
                                            <option value="">Select Class</option>
                                            {grades.find(g => g.id === formData.gradeId)?.classRooms?.map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Academic Year</label>
                                        <select
                                            value={formData.yearId}
                                            onChange={(e) => setFormData({ ...formData, yearId: e.target.value })}
                                            className={`w-full px-4 py-2 bg-slate-50 border ${errors.yearId ? "border-red-300" : "border-slate-200"} rounded-xl outline-none font-bold text-sm bg-white`}
                                        >
                                            <option value="">Select Year</option>
                                            {academicYears.map(y => (
                                                <option key={y.id} value={y.id}>{y.name} {y.isActive ? '(Active)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className={`w-full px-4 py-2 pr-12 bg-slate-50 border ${errors.password ? "border-red-300" : "border-slate-200"} rounded-xl outline-none font-bold text-sm`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-span-2 pt-2">
                                        <hr className="border-slate-100" />
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight italic">Contact Info (Optional)</p>
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">
                                            Email <span className="normal-case font-normal">(optional)</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email ?? ""}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full px-4 py-2 bg-slate-50 border ${errors.email ? "border-red-300" : "border-slate-200"
                                                } rounded-xl outline-none font-bold text-sm`}
                                            placeholder="student@school.com"
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                                            placeholder="+250..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2 text-slate-500 font-bold text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        {loading ? "Adding..." : "Add Student"}
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
