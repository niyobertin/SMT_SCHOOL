import React, { useState, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../redux/api/api";

interface HeaderProps {
  activeSection: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  role: string;
}

export const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    setLoadingUser(true);
    api
      .get("/users/profile")
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoadingUser(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-[#1a7ea5] rounded-full hidden md:block" />
          <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
            System / <span className="text-slate-900">{activeSection.replace("-", " ")}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {loadingUser ? (
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/profile")}
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-2 text-slate-700 font-bold hover:bg-slate-100 transition-all cursor-pointer group"
              >
                <div className="p-1 bg-[#1a7ea5]/10 rounded-lg group-hover:bg-[#1a7ea5]/20 transition-colors">
                  <User size={14} className="text-[#1a7ea5]" />
                </div>
                <span className="hidden sm:inline text-xs">{user.username}</span>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition-all bg-slate-50 border border-slate-100 hover:bg-red-50 hover:border-red-100 cursor-pointer"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-[#1a7ea5] text-white text-xs font-bold rounded-xl hover:opacity-90 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
