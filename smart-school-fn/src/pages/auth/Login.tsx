import { useState, useRef } from "react";
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Toast } from "primereact/toast";

import { loginUser } from "../../redux/features/auth";
import useLanguage from "../../hooks/useLanguage";
import type { AppDispatch, RootState } from "../../redux/stores";

import googleLogo from "../../assets/search.png";

export const LoginPage = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading } = useSelector((state: RootState) => state.auth);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const toast = useRef<Toast>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Email or phone number is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      const result = await dispatch(loginUser({ identifier: identifier.trim(), password }));
      if (loginUser.fulfilled.match(result)) {
        toast.current?.show({
          severity: "success",
          summary: t("loginSuccess") || "Login Successful",
          detail: t("welcomeBackMsg") || "Welcome back!",
          life: 3000,
        });
        const role = result.payload.data.user.role;
        if (role === "STUDENT") {
          setTimeout(() => navigate("/"), 1500);
        } else {
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      }
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#6cb9cc] overflow-hidden">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative"
        >
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-20">
            <div className="w-24 h-24 bg-[#1a7ea5] rounded-full flex items-center justify-center border-4 border-[#6cb9cc] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="bg-white pt-14 pb-8 px-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] relative rounded-xl overflow-hidden">
            <div className="text-center mb-8">
              <h2 className="text-2xl text-[#1a7ea5] font-bold tracking-tight">Login</h2>
              <p className="text-xs text-gray-400 mt-1 font-light">Access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email or Phone Number"
                    className="w-full bg-[#f9fafb] border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-gray-700 focus:ring-2 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                  />
                </div>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#f9fafb] border border-gray-200 rounded-lg py-3 pl-10 pr-10 text-gray-700 focus:ring-2 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}

              <div className="flex justify-end">
                <Link to="/request-link" className="text-xs text-[#1a7ea5] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a7ea5] hover:bg-[#156d8f] text-white py-3 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Authenticating..." : "Login"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-[10px] font-medium uppercase tracking-widest">
                <span className="bg-white px-4 text-gray-300">Or continue with</span>
              </div>
            </div>

            <a
              href={`${import.meta.env.VITE_API_URL}/api/users/auth/google`}
              className="flex items-center justify-center gap-2 bg-[#f9fafb] border border-gray-200 py-3 rounded-lg transition-all hover:bg-gray-50"
            >
              <img src={googleLogo} alt="Google" className="h-5 w-5" />
              <span className="text-sm text-gray-600 font-semibold">Google</span>
            </a>

            <p className="mt-8 text-center text-sm text-gray-400 font-light">
              New to SMT School?{" "}
              <Link to="/register" className="text-[#1a7ea5] font-bold hover:underline ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
