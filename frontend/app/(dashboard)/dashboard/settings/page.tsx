'use client';

import { useState } from 'react';
import {
    Bell,
    Shield,
    User,
    Moon,
    Globe,
    LogOut,
    ChevronRight,
    Smartphone,
    Mail
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
    const { logout, user, token } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');

    // Notifications State
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        jobs: true,
        updates: false
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Profile State (simplistic for now, assuming user context updates)
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || '',
        location: user?.location || '',
        about: user?.about || ''
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePasswordChange = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password
                })
            });

            if (res.ok) {
                setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
                setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
            } else {
                const data = await res.json();
                setPasswordMessage({ type: 'error', text: data.detail || 'Failed to change password' });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok || res.status === 204) {
                logout();
            } else {
                alert("Failed to delete account");
            }
        } catch (error) {
            console.error("Delete account error", error);
            alert("An error occurred while deleting account");
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500">Manage your account preferences and application settings.</p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {/* Settings Sidebar */}
                    <div className="md:col-span-1 space-y-2">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general'
                                ? 'bg-white text-primary shadow-sm border border-slate-200'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <User className="w-4 h-4" /> General
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications'
                                ? 'bg-white text-primary shadow-sm border border-slate-200'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Bell className="w-4 h-4" /> Notifications
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security'
                                ? 'bg-white text-primary shadow-sm border border-slate-200'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Shield className="w-4 h-4" /> Security
                        </button>

                        <div className="pt-4 border-t border-slate-200 mt-4">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[500px]">

                            {/* GENERAL TAB */}
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-4">Account Information</h2>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {user?.full_name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{user?.full_name || 'User'}</p>
                                                        <p className="text-xs text-slate-500">Personal Account</p>
                                                    </div>
                                                </div>
                                                {/* Edit functionality can be expanded later */}
                                                {/* <button className="text-sm text-primary hover:underline">Edit</button> */}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 border border-slate-200 rounded-lg">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                                                    <div className="flex items-center gap-2 mt-2 text-slate-700">
                                                        <Mail className="w-4 h-4" />
                                                        {user?.email}
                                                    </div>
                                                </div>
                                                <div className="p-4 border border-slate-200 rounded-lg">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase">Language</label>
                                                    <div className="flex items-center gap-2 mt-2 text-slate-700">
                                                        <Globe className="w-4 h-4" />
                                                        English (US)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Appearance</h2>
                                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                                                    <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Adjust the appearance of the application</p>
                                                </div>
                                            </div>
                                            <div
                                                onClick={toggleTheme}
                                                className={`flex items-center rounded-full p-1 w-12 h-6 cursor-pointer transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-slate-200'}`}
                                            >
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* NOTIFICATIONS TAB */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-4">Email Notifications</h2>
                                        {/* Mock Controls for now - Backend doesn't support generic preferences yet */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                                <div>
                                                    <p className="font-medium text-slate-900">Job Alerts</p>
                                                    <p className="text-xs text-slate-500">Get notified when new jobs match your profile</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.jobs}
                                                    onChange={() => toggleNotification('jobs')}
                                                    className="w-5 h-5 accent-primary"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                                <div>
                                                    <p className="font-medium text-slate-900">Product Updates</p>
                                                    <p className="text-xs text-slate-500">News about features and improvements</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.updates}
                                                    onChange={() => toggleNotification('updates')}
                                                    className="w-5 h-5 accent-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <h2 className="text-lg font-bold text-slate-900 mb-4">Push Notifications</h2>
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                                            <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-900">Enable Push Notifications</p>
                                                <p className="text-xs text-blue-700 mt-1">Get real-time updates on your interview status and roadmap progress.</p>
                                                <button className="text-xs font-semibold text-blue-600 mt-2 hover:underline">Enable in Browser</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SECURITY TAB */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-4">Login & Security</h2>
                                        <div className="space-y-4">
                                            <div className="p-4 border border-slate-200 rounded-lg">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Shield className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="font-medium text-slate-900">Change Password</p>
                                                        <p className="text-xs text-slate-500">Update your account password</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <input
                                                        type="password"
                                                        placeholder="Current Password"
                                                        className="w-full p-2 border border-slate-200 rounded text-sm"
                                                        value={passwordData.current_password}
                                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder="New Password"
                                                        className="w-full p-2 border border-slate-200 rounded text-sm"
                                                        value={passwordData.new_password}
                                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder="Confirm New Password"
                                                        className="w-full p-2 border border-slate-200 rounded text-sm"
                                                        value={passwordData.confirm_password}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                                    />

                                                    {passwordMessage.text && (
                                                        <p className={`text-xs ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                                            {passwordMessage.text}
                                                        </p>
                                                    )}

                                                    <button
                                                        onClick={handlePasswordChange}
                                                        disabled={!passwordData.current_password || !passwordData.new_password}
                                                        className="px-4 py-2 bg-slate-900 text-white text-sm rounded hover:bg-slate-800 disabled:opacity-50"
                                                    >
                                                        Update Password
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100">
                                        <h2 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h2>
                                        <div className="border border-red-100 bg-red-50 rounded-lg p-4">
                                            <p className="font-medium text-red-900">Delete Account</p>
                                            <p className="text-xs text-red-700 mt-1 mb-3">
                                                Permanently delete your account and all of your content. This action cannot be undone.
                                            </p>
                                            <button
                                                onClick={handleDeleteAccount}
                                                className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded hover:bg-red-50 transition-colors"
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
