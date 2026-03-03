import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowLeft, GraduationCap, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "primereact/toast";

import { loginUser } from "../../redux/features/auth";
import { studentLogin } from "../../redux/features/studentAuthActions";
import useLanguage from "../../hooks/useLanguage";
import { countryCodes } from "../../constants/countryCodes";
import type { AppDispatch, RootState } from "../../redux/stores";

import googleLogo from "../../assets/search.png";
import facebookLogo from "../../assets/facebook.png";

type LoginType = "staff" | "student";

const staffSchema = yup.object().shape({
  identifier: yup.string().required("Email is required"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

const studentSchema = yup.object().shape({
  schoolCode: yup.string().required("School code is required"),
  studentId: yup.string().required("Student ID is required"),
});

type FormData = {
  // Staff fields
  identifier?: string;
  // Student fields
  schoolCode?: string;
  studentId?: string;
  // Common
  password?: string;
};

export const LoginPage = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading: staffLoading } = useSelector((state: RootState) => state.auth);
  const { isLoading: studentLoading } = useSelector((state: RootState) => state.studentAuth);

  const [loginType, setLoginType] = useState<LoginType>("staff");
  const [showPassword, setShowPassword] = useState(false);

  const toast = useRef<Toast>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(
      (loginType === "staff" ? staffSchema : studentSchema) as any
    ) as any,
    defaultValues: {
      schoolCode: "",
      studentId: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const studentData = localStorage.getItem("student");

    if (userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "INSTRUCTOR") {
      navigate("/dashboard");
    } else if (studentData) {
      navigate("/student/dashboard");
    }
  }, [navigate]);

  const handleToggleLoginType = (type: LoginType) => {
    setLoginType(type);
    reset(); // Clear form when switching
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      if (loginType === "staff") {
        const loginData = {
          identifier: data.identifier!,
          password: data.password!,
        };
        const result = await dispatch(loginUser(loginData));
        if (loginUser.fulfilled.match(result)) {
          const redirectPath = result.payload.role === "SUPER_ADMIN" || result.payload.role === "ADMIN" || result.payload.role === "INSTRUCTOR" ? "/dashboard" : "/";
          toast.current?.show({
            severity: "success",
            summary: t("loginSuccess") || "Login Successful",
            detail: t("welcomeBackMsg") || "Welcome back!",
            life: 3000,
          });
          setTimeout(() => navigate(redirectPath), 1500);
        }
      } else {
        // Student Login
        const result = await dispatch(studentLogin(data as any));
        if (studentLogin.fulfilled.match(result)) {
          toast.current?.show({
            severity: "success",
            summary: t("studentLoginSuccess") || "Login Successful",
            detail: t("studentWelcomeMsg") || "Welcome to your student portal!",
            life: 3000,
          });
          setTimeout(() => navigate("/student/dashboard"), 1500);
        }
      }
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: t("loginFailed") || "Login Failed",
        detail: err.message || t("invalidCredentials") || "Invalid credentials",
        life: 5000,
      });
    }
  };

  const isLoading = staffLoading || studentLoading;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#6cb9cc] overflow-hidden font-outfit">
      <div className="absolute inset-0 bg-gradient-to-br from-[#6cb9cc] via-[#7fd1e3] to-[#5da3b5]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </div>

      <Toast ref={toast} position="top-right" />

      <div className="relative w-full max-w-[440px] z-10 pt-12">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative"
        >
          <motion.div layout className="absolute left-1/2 -top-12 -translate-x-1/2 z-20">
            <div className="w-24 h-24 bg-[#1a7ea5] rounded-full flex items-center justify-center border-4 border-[#6cb9cc] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              {loginType === "staff" ? (
                <Users className="w-12 h-12 text-white" />
              ) : (
                <GraduationCap className="w-12 h-12 text-white" />
              )}
            </div>
          </motion.div>

          <motion.div layout className="bg-white pt-14 pb-8 px-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] relative rounded-xl overflow-hidden">
            <motion.div layout className="text-center mb-6">
              <h2 className="text-2xl text-[#1a7ea5] font-bold tracking-tight uppercase">
                {loginType === "staff" ? "Staff Login" : "Student Login"}
              </h2>
              <p className="text-xs text-gray-400 mt-1 italic font-light">
                {loginType === "staff" ? "Access administrative tools" : "Access your learning portal"}
              </p>
            </motion.div>

            {/* Login Type Toggle */}
            <motion.div layout className="flex p-1 bg-[#f3f4f6] rounded-lg mb-6 border border-gray-100">
              <button
                type="button"
                onClick={() => handleToggleLoginType("staff")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm transition-all ${loginType === "staff"
                  ? "bg-white text-[#1a7ea5] shadow-sm font-bold"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                <Users size={16} />
                Staff/Admin
              </button>
              <button
                type="button"
                onClick={() => handleToggleLoginType("student")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm transition-all ${loginType === "student"
                  ? "bg-white text-[#1a7ea5] shadow-sm font-bold"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                <GraduationCap size={16} />
                Student
              </button>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                {loginType === "staff" ? (
                  <motion.div
                    key="staff-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <input
                        type="email"
                        {...register("identifier")}
                        placeholder="Email Address"
                        className="w-full bg-[#f9fafb] border border-gray-200 rounded-lg py-2.5 px-4 text-gray-700 focus:ring-2 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                      />
                      {errors.identifier && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.identifier.message}</p>}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="student-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <input
                        type="text"
                        {...register("schoolCode")}
                        placeholder="School Code (e.g. PS-2024)"
                        className="w-full bg-[#f9fafb] border border-gray-200 rounded-lg py-2.5 px-4 text-gray-700 focus:ring-2 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                      />
                      {errors.schoolCode && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.schoolCode.message}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        {...register("studentId")}
                        placeholder="Student ID (e.g. STU-2024-001)"
                        className="w-full bg-[#f9fafb] border border-gray-200 rounded-lg py-2.5 px-4 text-gray-700 focus:ring-2 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                      />
                      {errors.studentId && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.studentId.message}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {loginType === "staff" && (
                  <motion.div
                    key="password-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="Password"
                        className="w-full bg-[#f9fafb] border border-gray-200 rounded-lg py-2.5 px-4 pr-10 text-gray-700 focus:ring-2 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.password.message}</p>}
                    </div>

                    {loginType === "staff" && (
                      <div className="flex justify-end">
                        <Link to="/request-link" className="text-xs text-[#1a7ea5] hover:underline font-medium">
                          Forgot password?
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                layout
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1a7ea5] hover:bg-[#156d8f] text-white py-3 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Authenticating..." : loginType === "staff" ? "Staff Login" : "Student Login"}
              </motion.button>
            </form>

            <AnimatePresence>
              {loginType === "staff" && (
                <motion.div
                  key="social-login"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-medium uppercase tracking-widest">
                      <span className="bg-white px-4 text-gray-300">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <a
                      href={`${import.meta.env.VITE_API_URL}/api/users/auth/google`}
                      className="flex items-center justify-center gap-2 bg-[#f9fafb] border border-gray-200 py-2.5 rounded-lg transition-all hover:bg-gray-50"
                    >
                      <img src={googleLogo} alt="Google" className="h-4 w-4" />
                      <span className="text-xs text-gray-600 font-semibold">Google</span>
                    </a>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/api/users/auth/facebook`}
                      className="flex items-center justify-center gap-2 bg-[#1877F2] py-2.5 rounded-lg transition-all hover:bg-[#166fe5] shadow-sm"
                    >
                      <img src={facebookLogo} alt="Facebook" className="h-4 w-4 brightness-0 invert" />
                      <span className="text-xs text-white font-semibold">Facebook</span>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.p layout className="mt-8 text-center text-sm text-gray-400 font-light">
              {loginType === "staff" ? (
                <>
                  New to SMT School?{" "}
                  <Link to="/register" className="text-[#1a7ea5] font-bold hover:underline ml-1">
                    Create Admin Account
                  </Link>
                </>
              ) : (
                "Credentials lost? Contact your school administration."
              )}
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
