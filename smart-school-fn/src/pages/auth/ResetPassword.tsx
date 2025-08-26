import React, { useRef, useEffect } from "react";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Toast } from "primereact/toast";
import { useDispatch, useSelector } from "react-redux";

import { AuthHeader } from "../../components/headers/authHeader";
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
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const password = watch("password", "");

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
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <Toast ref={toast} position="top-right" />
      <AuthHeader />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <Lock className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center">Set New Password</h2>
        <p className="text-center text-gray-500 mb-6">
          Create a new password for your account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="New password"
                className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Confirm new password"
                className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="text-xs text-gray-500">
            <p className="flex items-center mb-1">
              <CheckCircle
                className={`h-3 w-3 mr-1 ${
                  password.length >= 8 ? "text-green-500" : "text-gray-400"
                }`}
              />
              At least 8 characters
            </p>
            <p className="flex items-center mb-1">
              <CheckCircle
                className={`h-3 w-3 mr-1 ${
                  /[A-Z]/.test(password) ? "text-green-500" : "text-gray-400"
                }`}
              />
              At least one uppercase letter
            </p>
            <p className="flex items-center mb-1">
              <CheckCircle
                className={`h-3 w-3 mr-1 ${
                  /[a-z]/.test(password) ? "text-green-500" : "text-gray-400"
                }`}
              />
              At least one lowercase letter
            </p>
            <p className="flex items-center mb-1">
              <CheckCircle
                className={`h-3 w-3 mr-1 ${
                  /\d/.test(password) ? "text-green-500" : "text-gray-400"
                }`}
              />
              At least one number
            </p>
            <p className="flex items-center">
              <CheckCircle
                className={`h-3 w-3 mr-1 ${
                  /[@$!%*?&]/.test(password) ? "text-green-500" : "text-gray-400"
                }`}
              />
              At least one special character (@$!%*?&)
            </p>
          </div>

          <button
            type="submit"
            className={`w-full py-2 rounded-lg text-white font-medium ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-800 hover:bg-blue-900"
            } transition-colors`}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <Link 
            to="/login" 
            className="text-blue-600 hover:underline"
            onClick={(e) => loading && e.preventDefault()}
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};
