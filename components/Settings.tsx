import React, { useState, useEffect } from "react";
import { User, LoginHistory } from "../types";
import {
  Shield,
  Clock,
  Smartphone,
  Monitor,
  Globe,
  Trash2,
  User as UserIcon,
  Lock,
  Save,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import { API_ENDPOINTS } from "./config"; // Import config

interface SettingsProps {
  user: User;
}

// Reusable Password Input Component (Defined outside to prevent focus issues)
interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  placeholder: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  isVisible,
  toggleVisibility,
  placeholder,
}) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative">
      <Lock
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}
      />
      <input
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password" // Prevents aggressive browser autofill
        className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 font-bold text-gray-700 transition-all placeholder:font-medium placeholder:text-gray-400"
      />
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1"
        tabIndex={-1}
        title={isVisible ? "Hide Password" : "Show Password"}
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [history, setHistory] = useState<LoginHistory[]>([]);

  // Profile State
  const [username] = useState(user.username); // Removed setUsername to make it read-only
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility State
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/history/${user.id}`);
      const data = await response.json();
      setHistory(data.map((h: any) => ({ ...h, id: h._id })));
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (newPassword && newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (newPassword && !currentPassword) {
      alert("Please enter your current password to confirm changes.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/profile/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username, // Send existing username
            currentPassword: currentPassword || undefined,
            newPassword: newPassword || undefined,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          "pos_user",
          JSON.stringify({ ...user, username: data.username }),
        );
        alert("Password updated successfully!");

        // Reset password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowCurrentPass(false);
        setShowNewPass(false);
        setShowConfirmPass(false);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to delete all login logs?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/history/${user.id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setHistory([]);
      } else {
        alert("Failed to clear history");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-gray-500 font-medium">
          Manage your personal profile and security preferences.
        </p>
      </header>

      {/* 1. Profile Information Card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
            <UserIcon size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Profile Information
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Update your account credentials
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Username
              </label>
              <div className="relative">
                <UserIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={username}
                  disabled // UPDATED: Username is now read-only
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-transparent rounded-xl font-bold text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Role
              </label>
              <div className="relative">
                <Shield
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={user.role}
                  disabled
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-transparent rounded-xl font-bold text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <KeyRound size={16} className="text-indigo-500" />
              Change Password
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              {/* Current Password - Full Width on Mobile, Span 2 on Desktop */}
              <div className="md:col-span-2">
                <PasswordInput
                  label="Current Password"
                  placeholder="Enter current password to verify"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  isVisible={showCurrentPass}
                  toggleVisibility={() => setShowCurrentPass(!showCurrentPass)}
                />
              </div>

              {/* New Password */}
              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={setNewPassword}
                isVisible={showNewPass}
                toggleVisibility={() => setShowNewPass(!showNewPass)}
              />

              {/* Confirm Password */}
              <PasswordInput
                label="Confirm Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                isVisible={showConfirmPass}
                toggleVisibility={() => setShowConfirmPass(!showConfirmPass)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-70"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Login History Card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Login History</h2>
              <p className="text-xs text-gray-500 font-medium">
                Recent activity on your account
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 py-2.5 rounded-xl transition-all border border-transparent hover:border-rose-100"
            >
              <Trash2 size={16} />
              Clear Logs
            </button>
          )}
        </div>
        <div className="p-0">
          <ul className="divide-y divide-gray-100">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                    {entry.deviceType === "Mobile" ? (
                      <Smartphone size={22} />
                    ) : (
                      <Monitor size={22} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 capitalize">
                      {entry.deviceType} Login
                    </p>
                    <p className="text-xs text-gray-500 max-w-md truncate flex items-center gap-1.5 mt-0.5">
                      <Globe size={12} />
                      {entry.userAgent}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {format(new Date(entry.timestamp), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5 font-medium">
                    <Clock size={12} />
                    {format(new Date(entry.timestamp), "h:mm a")}
                  </p>
                </div>
              </li>
            ))}
            {history.length === 0 && (
              <li className="p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <Shield size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-bold">
                  No login records found
                </p>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer Contact Info */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          TrustLayerr 
        </h3>
        <div className="text-gray-600 font-medium space-y-0.5">
          <p>Director - Harshwardhan Jagtap</p>
          <p>For Inquiry call - +91 9028848497</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
