import React, { useState, useEffect, useRef } from "react";
import { X, Lock, Eye, EyeOff, Edit } from "lucide-react";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import api from "../redux/api/api";
import { PageLoader } from "../components/common/Loading";
import { Toast } from "primereact/toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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

/** Yup Schemas */
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
        .min(6, "Password must be at least 6 characters")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/\d/, "Password must contain at least one number")
        .matches(/[@$!%*?&]/, "Password must contain at least one special character"),
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

    /** Profile Form */
    const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset: resetProfileForm } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            username: "",
            phoneNumber: "",
        },
        mode: "onBlur",
    });

    /** Password Form */
    const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPasswordForm } = useForm({
        resolver: yupResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onBlur",
    });

    /** Fetch profile */
    useEffect(() => {
        const fetchProfile = async () => {
            setGlobalLoading(true);
            try {
                const res = await api.get("/users/profile");
                setProfile(res.data.data);
                setOriginalProfile(res.data.data);

                // Set form defaults
                resetProfileForm({
                    firstName: res.data.data.firstName,
                    lastName: res.data.data.lastName,
                    username: res.data.data.username,
                    phoneNumber: res.data.data.phoneNumber || "",
                });
            } catch {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to load profile.",
                    life: 3000,
                });
            } finally {
                setGlobalLoading(false);
            }
        };
        fetchProfile();
    }, [resetProfileForm]);

    const toggleEditMode = () => {
        setIsEditMode(true);
    };

    const cancelEdit = () => {
        setIsEditMode(false);
        setShowPasswordSection(false);

        if (originalProfile) {
            resetProfileForm({
                firstName: originalProfile.firstName,
                lastName: originalProfile.lastName,
                username: originalProfile.username,
                phoneNumber: originalProfile.phoneNumber || "",
            });
        }
    };

    /** Update Profile */
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

    /** Update Password */
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

    /** Delete Account */
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
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("user");
                    localStorage.removeItem("role");
                    toast.current?.show({ severity: "success", summary: "Deleted", detail: "Account deleted.", life: 3000 });
                    window.location.href = "/login";
                } catch {
                    toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to delete account.", life: 3000 });
                } finally {
                    setGlobalLoading(false);
                }
            },
        });
    };

    if (globalLoading) return <PageLoader globalLoading={globalLoading} />;
    if (!profile) return <div className="p-8 text-center">No profile found.</div>;

    const getInitials = () => `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
            <Toast ref={toast} position="top-right" />
            <ConfirmDialog />
            <div className="container mx-auto px-4 py-8 max-w-4xl">

                {/* Profile Card */}
                <div className="bg-white flex flex-col md:flex-row gap-4 rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
                    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-8 py-12 text-center text-white flex-shrink-0 md:w-1/3">
                        <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">{getInitials()}</div>
                        <h1 className="mt-4 text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
                        <p className="text-sm opacity-90">{profile.username}</p>
                        <p className="opacity-80">{profile.role}</p>
                    </div>

                    <div className="p-6 flex-1 grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { label: "Total Tests", value: profile.testAttempts.length },
                            { label: "Passing Tests", value: profile.testAttempts.filter(t => t.isPassed).length },
                            { label: "Failed Tests", value: profile.testAttempts.filter(t => !t.isPassed).length },
                            { label: "Best Score", value: profile.testAttempts.reduce((max, t) => Math.max(max, t.score), 0).toFixed(2) },
                            { label: "Average Score", value: profile.testAttempts.length ? (profile.testAttempts.reduce((sum, t) => sum + t.score, 0) / profile.testAttempts.length).toFixed(2) : "0.00" },
                            { label: "Longest Time Spent (min)", value: profile.testAttempts.reduce((max, t) => Math.max(max, t.timeSpent), 0).toFixed(2) },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-blue-50 rounded-2xl p-4 flex flex-col items-center justify-center shadow hover:shadow-md transition-shadow">
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="mt-1 text-xl font-bold text-blue-600">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="bg-white rounded-3xl shadow-xl border p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="First Name" {...registerProfile("firstName")} readOnly={!isEditMode} error={profileErrors.firstName?.message} />
                        <Input label="Last Name" {...registerProfile("lastName")} readOnly={!isEditMode} error={profileErrors.lastName?.message} />
                    </div>
                    <Input label="Username" {...registerProfile("username")} readOnly={!isEditMode} error={profileErrors.username?.message} />
                    <Input label="Email" value={profile.email} readOnly />
                    <Input label="Phone Number" {...registerProfile("phoneNumber")} readOnly={!isEditMode} error={profileErrors.phoneNumber?.message} />

                    <div className="flex flex-wrap gap-4 justify-center pt-8 border-t">
                        {!isEditMode ? (
                            <button type="button" onClick={toggleEditMode} className="px-8 py-3 bg-blue-600 text-white rounded-xl"><Edit className="inline w-5 h-5 mr-2" /> Update Profile</button>
                        ) : (
                            <>
                                <button type="button" onClick={cancelEdit} className="px-6 py-3 bg-gray-500 text-white rounded-xl"><X className="inline w-4 h-4 mr-1" /> Cancel</button>
                                <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-xl">Save Changes</button>
                            </>
                        )}
                    </div>
                </form>

                {/* Password Form */}
                <div className="bg-white rounded-3xl shadow-xl border p-8 mt-10">
                    <button onClick={() => setShowPasswordSection((s) => !s)} className="w-full text-left flex justify-between items-center font-semibold text-gray-700">
                        <span className="flex items-center gap-2"><Lock /> Change Password</span>
                        {showPasswordSection ? <X /> : <Eye />}
                    </button>

                    {showPasswordSection && (
                        <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="mt-6 space-y-4">
                            <PasswordInput label="Current Password" {...registerPassword("currentPassword")} show={showPasswords.current} toggle={() => setShowPasswords(s => ({ ...s, current: !s.current }))} error={passwordErrors.currentPassword?.message} />
                            <PasswordInput label="New Password" {...registerPassword("password")} show={showPasswords.new} toggle={() => setShowPasswords(s => ({ ...s, new: !s.new }))} error={passwordErrors.password?.message} />
                            <PasswordInput label="Confirm Password" {...registerPassword("confirmPassword")} show={showPasswords.confirm} toggle={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))} error={passwordErrors.confirmPassword?.message} />
                            <button type="submit" className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl">Update Password</button>
                        </form>
                    )}
                </div>

                {/* Delete Account */}
                <div className="bg-white rounded-3xl shadow-xl border p-8 mt-10">
                    <h2 className="text-lg font-semibold mb-4 text-red-700">Danger Zone</h2>
                    <button onClick={handleDeleteAccount} className="px-6 py-3 bg-red-600 text-white rounded-xl flex items-center gap-2 hover:bg-red-700">
                        <i className="pi pi-trash" /> Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

/* Input Components */
const Input: React.FC<any> = ({ label, error, ...props }) => (
    <div className="space-y-2">
        <label className="font-semibold text-sm text-gray-700">{label}</label>
        <input className={`w-full px-4 py-3 rounded-xl border ${props.readOnly ? "bg-gray-100" : "border-gray-300"}`} {...props} />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const PasswordInput: React.FC<any> = ({ label, show, toggle, error, ...props }) => (
    <div className="space-y-2">
        <label className="font-semibold text-sm text-gray-700">{label}</label>
        <div className="relative">
            <input type={show ? "text" : "password"} className="w-full px-4 py-3 rounded-xl border border-gray-300" {...props} />
            <button type="button" onClick={toggle} className="absolute right-3 top-3 text-gray-500">{show ? <EyeOff /> : <Eye />}</button>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);
