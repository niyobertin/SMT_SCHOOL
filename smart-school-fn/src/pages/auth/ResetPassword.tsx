import React, { useRef, useEffect } from "react";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { Toast } from "primereact/toast";
import { useDispatch, useSelector } from "react-redux";

import { resetPassword } from "../../redux/features/auth";
import type { AppDispatch, RootState } from "../../redux/stores";

interface FormData {
  password: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Must be at least 8 characters")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/\d/, "Must contain at least one number")
    .matches(/[@$!%*?&]/, "Must contain at least one special character"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export const ResetPassword = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const toast = useRef<Toast>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (error && toast.current) {
      toast.current.show({
        severity: "error",
        summary: "Reset Password Failed",
        detail: error,
        life: 3000,
      });
    }
  }, [error]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!token) return;

    try {
      const response = await dispatch(
        resetPassword({
          password: data.password,
          confirmPassword: data.confirmPassword,
          token
        })
      ).unwrap();

      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: response.message || "Password has been reset successfully",
          life: 3000,
        });
      }

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      // Error handled by useEffect
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#6cb9cc] overflow-hidden font-outfit">
      {/* Background depth effect matching ExamLogin */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6cb9cc] via-[#7fd1e3] to-[#5da3b5]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -ml-48 -mb-48" />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/login" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Login</span>
        </Link>
      </div>

      <Toast ref={toast} position="top-right" />

      <div className="relative w-full max-w-[420px] z-10 pt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* Overlapping Avatar matching ExamLogin */}
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-20">
            <div className="w-24 h-24 bg-[#1a7ea5] rounded-full flex items-center justify-center border-4 border-[#6cb9cc] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Card matching ExamLogin */}
          <div className="bg-white pt-14 pb-8 px-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] relative">
            <div className="text-center mb-5">
              <h2 className="text-2xl text-gray-500 font-light tracking-wide italic uppercase">
                New Password
              </h2>
              <p className="text-xs text-gray-400 mt-1 italic font-light">Secure your account access</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="New Password"
                  className="w-full bg-[#eeeeee] border border-gray-200 rounded-sm py-2.5 px-4 pr-10 text-left text-gray-700 focus:ring-1 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.password && <p className="text-[10px] text-red-500 mt-1 italic">{errors.password.message}</p>}
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm Password"
                  className="w-full bg-[#eeeeee] border border-gray-200 rounded-sm py-2.5 px-4 pr-10 text-left text-gray-700 focus:ring-1 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-500 mt-1 italic">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a7ea5] hover:bg-[#156d8f] text-white py-3 text-lg font-medium transition-colors shadow-md rounded-[2px]"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
