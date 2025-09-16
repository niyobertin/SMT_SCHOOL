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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 capitalize">
          {activeSection.replace("-", " ")}
        </h1>

        <div className="flex items-center gap-4">
          {loadingUser ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => navigate("/profile")}
                className=" bg-blue-500 rounded-lg  flex items-center justify-center gap-2 text-white font-semibold hover:opacity-90 transition p-2 cursor-pointer"
              >
                {<User size={16} />}<span className="hidden sm:inline font-medium">{user.username}</span>
              </button>



              <button
                onClick={handleLogout}
                className="ml-3 p-2 text-gray-900 font-medium hover:text-gray-600 rounded-lg transition flex items-center gap-2 bg-gray-200 p-2 cursor-pointer"
                title="Logout"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:opacity-90 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
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
