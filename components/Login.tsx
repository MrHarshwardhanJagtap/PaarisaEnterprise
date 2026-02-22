import React, { useState } from "react";
import { User, UserRole } from "../types";
import { Milk, Lock, User as UserIcon, ShieldCheck } from "lucide-react";
import { API_ENDPOINTS } from "./config"; // Import config

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.MANUFACTURER);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent)
            ? "Mobile"
            : "Desktop",
          userAgent: navigator.userAgent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const user: User = {
        id: data.id || data._id,
        username: data.username,
        role: data.role,
      };

      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-10">

          <div className="inline-flex items-center justify-center p-4 rounded-3xl mb-6 transform hover:scale-110 transition-transform">
            <img
              src="/logo.png"
              alt="Paaris Enterprises Logo"
              width={80}
              height={80}
            />
          </div>

          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Paaris Enterprises
          </h1>
          <p className="text-gray-600 mt-3 font-medium text-lg">
            Inventory & Order Control
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <UserIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-semibold"
                />
              </div>

              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                  size={20}
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-semibold"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                <ShieldCheck size={20} className="text-red-500 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4.5 rounded-2xl font-black text-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Authenticating..." : "Secure Login"}
            </button>
          </form>
        </div>

        {/* Footer Contact Info */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">TrustLayerr</h3>
          <div className="text-gray-600 font-medium space-y-0.5">
            <p>Director - Harshwardhan Jagtap</p>
            <p>For Inquiry call - +91 9028848497</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
