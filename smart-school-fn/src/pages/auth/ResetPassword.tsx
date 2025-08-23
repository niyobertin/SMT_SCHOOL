import React, { useState } from "react";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthHeader } from "../../components/headers/authHeader";

export const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reset password attempt:", formData);
    // 🔑 Add API call here
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="New password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500">
            <p className="flex items-center mb-1">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              At least 8 characters
            </p>
            <p className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              Include numbers and special characters
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg text-white font-medium bg-blue-800 cursor-pointer "
          >
            Reset Password
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};
