import React, { useState, useEffect, useRef } from "react";
import { Lock, Eye, EyeOff, Edit, User, Mail, Phone, Shield, Trash2, Trophy, BarChart3, Clock as ClockIcon } from "lucide-react";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import api from "../redux/api/api";
import { Toast } from "primereact/toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    username: string;
    role: string;
    avatar: string;
    isActive: boolean;
    isVerified: boolean;
    testAttempts: Array<{
        id: string;
        startTime: string;
        endTime: string;
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        status: string;
        timeSpent: number;
        isPassed: boolean;
        userId: string;
        testId: string;
    }>;
    createdAt: string;
    updatedAt: string;
    lastLogin: string | null;
}

const profileSchema = yup.object({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    username: yup.string().required("Username is required").min(3, "Username must be at least 3 characters"),
    phoneNumber: yup.string().nullable().matches(/^\+?\d{7,15}$/, "Invalid phone number"),
});

const passwordSchema = yup.object({
    currentPassword: yup.string().required("Current password is required"),
    password: yup.string()
        .required("New password is required")
        .min(6, "Password must be at least 6 characters"),
    confirmPassword: yup.string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Confirm password is required"),
});

export const UserProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [globalLoading, setGlobalLoading] = useState(false);
    const toast = useRef<Toast>(null);

    const { register: registerProfile, handleSubmit: handleProfileSubmit, reset: resetProfileForm } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            username: "",
            phoneNumber: "",
        },
        mode: "onBlur",
    });

    const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPasswordForm } = useForm({
        resolver: yupResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onBlur",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setGlobalLoading(true);
            try {
                const res = await api.get("/users/profile");
                setProfile(res.data.data);
                setOriginalProfile(res.data.data);
                resetProfileForm({
                    firstName: res.data.data.firstName,
                    lastName: res.data.data.lastName,
                    username: res.data.data.username,
                    phoneNumber: res.data.data.phoneNumber || "",
                });
            } catch {
                toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load profile.", life: 3000 });
            } finally {
                setGlobalLoading(false);
            }
        };
        fetchProfile();
    }, [resetProfileForm]);

    const toggleEditMode = () => setIsEditMode(true);
    const cancelEdit = () => {
        setIsEditMode(false);
        if (originalProfile) {
            resetProfileForm({
                firstName: originalProfile.firstName,
                lastName: originalProfile.lastName,
                username: originalProfile.username,
                phoneNumber: originalProfile.phoneNumber || "",
            });
        }
    };

    const onSubmitProfile = async (data: any) => {
        if (!profile) return;
        setGlobalLoading(true);
        try {
            await api.patch(`/users/${profile.id}`, data);
            toast.current?.show({ severity: "success", summary: "Success", detail: "Profile updated successfully!", life: 3000 });
            setProfile((prev) => prev && { ...prev, ...data });
            setOriginalProfile((prev) => prev && { ...prev, ...data });
            setIsEditMode(false);
        } catch {
            toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to update profile.", life: 3000 });
        } finally {
            setGlobalLoading(false);
        }
    };

    const onSubmitPassword = async (data: any) => {
        if (!profile) return;
        setGlobalLoading(true);
        try {
            await api.patch(`/users/${profile.id}/password`, {
                currentPassword: data.currentPassword,
                password: data.password,
            });
            toast.current?.show({ severity: "success", summary: "Success", detail: "Password updated successfully!", life: 3000 });
            resetPasswordForm();
            setShowPasswordSection(false);
        } catch {
            toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to update password.", life: 3000 });
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        confirmDialog({
            message: "Are you sure you want to delete your account? This action cannot be undone.",
            header: "Delete Account",
            icon: "pi pi-exclamation-triangle text-red-500",
            acceptClassName: "p-button-danger text-white",
            rejectClassName: "p-button-secondary text-white",
            accept: async () => {
                try {
                    setGlobalLoading(true);
                    await api.patch(`/users/${profile?.id}`, { isActive: false, isVerified: false });
                    localStorage.removeItem("accessToken");
                    window.location.href = "/login";
                } catch {
                    toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to delete account.", life: 3000 });
                } finally {
                    setGlobalLoading(false);
                }
            },
        });
    };

    if (globalLoading && !profile) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-slate-100 border-t-[#1a7ea5] rounded-full mb-6"
            />
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">Preparing Profile</h2>
            <p className="text-slate-500 font-medium">Please wait while we fetch your information...</p>
        </div>
    );
    if (!profile) return <div className="p-8 text-center">No profile found.</div>;

    const getInitials = () => `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

    const stats = [
        { label: "Total Tests", value: profile.testAttempts.length, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
        {
            label: "Passing Tests",
            value: profile.testAttempts.filter(t => t.isPassed).length,
            icon: Trophy,
            color: profile.testAttempts.filter(t => t.isPassed).length > 0 ? "text-green-600" : "text-slate-400",
            bg: "bg-green-50"
        },
        { label: "Best Score", value: `${profile.testAttempts.reduce((max, t) => Math.max(max, t.score), 0).toFixed(1)}%`, icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Time Taken", value: `${profile.testAttempts.reduce((max, t) => Math.max(max, t.timeSpent), 0).toFixed(0)}m`, icon: ClockIcon, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    return (
        <div className="min-h-screen bg-white pb-24">
            <Toast ref={toast} position="top-right" />
            <ConfirmDialog />

            {/* Profile Hero Section */}
            <div className="bg-slate-50 pt-16 pb-24 border-b border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1a7ea5]/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6cb9cc]/5 rounded-full -ml-48 -mb-48 blur-3xl opacity-50" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:items-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-32 h-32 bg-[#1a7ea5] rounded-3xl flex items-center justify-center text-4xl font-bold text-white border-4 border-white"
                        >
                            {getInitials()}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center md:text-left flex-grow"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 uppercase tracking-tight">
                                    {profile.firstName} {profile.lastName}
                                </h1>
                                <span className="px-3 py-1 bg-[#1a7ea5] text-white rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mx-auto md:mx-0">
                                    {profile.role}
                                </span>
                            </div>
                            <p className="text-slate-500 font-semibold uppercase tracking-widest text-[13px] flex items-center justify-center md:justify-start gap-2">
                                <Mail size={14} className="text-[#1a7ea5]" />
                                {profile.email}
                            </p>
                        </motion.div>

                        {!isEditMode && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={toggleEditMode}
                                className="px-6 py-3 bg-white text-[#1a7ea5] border border-slate-200 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                            >
                                <Edit size={16} /> Edit Profile
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-8 rounded-3xl border border-slate-100"
                        >
                            <h3 className="text-[11px] font-bold uppercase tracking-[.2em] text-[#1a7ea5] mb-6">Learning Metrics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {stats.map((stat, i) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-white/50 flex flex-col items-center justify-center text-center group hover:scale-[1.05] transition-transform`}>
                                            <Icon size={20} className={`${stat.color} mb-2`} />
                                            <p className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-400 mb-1">{stat.label}</p>
                                            <p className={`text-xl font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#1a7ea5] p-8 rounded-3xl text-white"
                        >
                            <h3 className="text-[11px] font-bold uppercase tracking-[.2em] text-white/60 mb-6">Account Status</h3>
                            <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/20">
                                <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
                                    <Shield size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Verified Member</p>
                                    <p className="font-semibold text-sm">Since {new Date(profile.createdAt).getFullYear()}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Settings Area */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Profile Settings */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 border-l-4 border-[#1a7ea5] pl-4">Personal Information</h3>
                            </div>

                            <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a7ea5] ml-4">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a7ea5] w-4 h-4 opacity-40" />
                                            <input
                                                {...registerProfile("firstName")}
                                                readOnly={!isEditMode}
                                                className={`w-full pl-14 pr-6 py-4 rounded-full border-none transition-all font-semibold text-slate-700 ${isEditMode ? "bg-slate-50 ring-2 ring-[#6cb9cc]/20 focus:ring-[#1a7ea5]" : "bg-slate-50/50 cursor-not-allowed text-slate-400"}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a7ea5] ml-4">Last Name</label>
                                        <div className="relative">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a7ea5] w-4 h-4 opacity-40" />
                                            <input
                                                {...registerProfile("lastName")}
                                                readOnly={!isEditMode}
                                                className={`w-full pl-14 pr-6 py-4 rounded-full border-none transition-all font-semibold text-slate-700 ${isEditMode ? "bg-slate-50 ring-2 ring-[#6cb9cc]/20 focus:ring-[#1a7ea5]" : "bg-slate-50/50 cursor-not-allowed text-slate-400"}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a7ea5] ml-4">Username</label>
                                    <input
                                        {...registerProfile("username")}
                                        readOnly={!isEditMode}
                                        className={`w-full px-6 py-4 rounded-full border-none transition-all font-semibold text-slate-700 ${isEditMode ? "bg-slate-50 ring-2 ring-[#6cb9cc]/20 focus:ring-[#1a7ea5]" : "bg-slate-50/50 cursor-not-allowed text-slate-400"}`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a7ea5] ml-4 opacity-50">Email Address (Read Only)</label>
                                    <input
                                        value={profile.email}
                                        readOnly
                                        className="w-full px-6 py-4 rounded-full border-none bg-slate-100/50 text-slate-400 font-semibold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a7ea5] ml-4">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a7ea5] w-4 h-4 opacity-40" />
                                        <input
                                            {...registerProfile("phoneNumber")}
                                            readOnly={!isEditMode}
                                            className={`w-full pl-14 pr-6 py-4 rounded-full border-none transition-all font-semibold text-slate-700 ${isEditMode ? "bg-slate-50 ring-2 ring-[#6cb9cc]/20 focus:ring-[#1a7ea5]" : "bg-slate-50/50 cursor-not-allowed text-slate-400"}`}
                                        />
                                    </div>
                                </div>

                                {isEditMode && (
                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="submit"
                                            className="px-10 py-4 bg-[#1a7ea5] text-white font-bold uppercase tracking-widest text-[12px] rounded-full hover:bg-[#156d8f] transition-all"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="px-10 py-4 bg-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[12px] rounded-full hover:bg-slate-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </form>
                        </motion.div>

                        {/* Security Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 border-l-4 border-slate-200 pl-4">Security Settings</h3>
                                <button
                                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${showPasswordSection ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                                >
                                    {showPasswordSection ? "Hide Settings" : "Manage Password"}
                                </button>
                            </div>

                            <AnimatePresence>
                                {showPasswordSection && (
                                    <motion.form
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        onSubmit={handlePasswordSubmit(onSubmitPassword)}
                                        className="space-y-6 overflow-hidden"
                                    >
                                        <div className="space-y-4 pt-4">
                                            <PasswordInput
                                                label="Current Password"
                                                {...registerPassword("currentPassword")}
                                                show={showPasswords.current}
                                                toggle={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                                                error={passwordErrors.currentPassword?.message}
                                            />
                                            <PasswordInput
                                                label="New Password"
                                                {...registerPassword("password")}
                                                show={showPasswords.new}
                                                toggle={() => setShowPasswords(s => ({ ...s, new: !s.new }))}
                                                error={passwordErrors.password?.message}
                                            />
                                            <PasswordInput
                                                label="Confirm New Password"
                                                {...registerPassword("confirmPassword")}
                                                show={showPasswords.confirm}
                                                toggle={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                                                error={passwordErrors.confirmPassword?.message}
                                            />
                                            <button
                                                type="submit"
                                                className="px-10 py-4 bg-slate-900 text-white font-bold uppercase tracking-widest text-[12px] rounded-full hover:bg-[#1a7ea5] transition-all mt-4"
                                            >
                                                Update Security
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Danger Zone */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-red-50/50 p-8 md:p-10 rounded-3xl border border-red-100"
                        >
                            <h3 className="text-xl font-bold uppercase tracking-tight text-red-900 mb-2">Danger Zone</h3>
                            <p className="text-red-600/60 text-sm font-medium mb-8">Once you delete your account, there is no going back. Please be certain.</p>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-8 py-4 bg-white border border-red-200 text-red-600 font-bold uppercase tracking-widest text-[12px] rounded-full hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Deactivate Account
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PasswordInput: React.FC<any> = ({ label, show, toggle, error, ...props }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a7ea5] ml-4">{label}</label>
        <div className="relative">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a7ea5] w-4 h-4 opacity-40" />
            <input
                type={show ? "text" : "password"}
                className="w-full pl-14 pr-16 py-4 rounded-full border-none bg-slate-50 ring-2 ring-[#6cb9cc]/20 focus:ring-[#1a7ea5] transition-all font-semibold text-slate-700"
                {...props}
            />
            <button
                type="button"
                onClick={toggle}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1a7ea5] transition-colors"
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
        {error && <p className="text-red-500 text-[10px] font-semibold ml-4 mt-1 uppercase tracking-wider">{error}</p>}
    </div>
);
