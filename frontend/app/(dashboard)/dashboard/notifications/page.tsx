'use client';

import { useState, useEffect } from 'react';
import { Bell, Briefcase, Shield, Info, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationsPage() {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/notifications/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [token]);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Global unread count update would go here if using a context
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const deleteNotification = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n._id !== id));

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to delete notification", error);
            // Revert on error? For now, we assume success or refresh.
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/notifications/read-all`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'job': return <Briefcase className="w-5 h-5 text-blue-600" />;
            case 'security': return <Shield className="w-5 h-5 text-red-600" />;
            case 'update': return <Info className="w-5 h-5 text-purple-600" />;
            default: return <Bell className="w-5 h-5 text-slate-600" />;
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                        <p className="text-slate-500">Stay updated with your career progress and alerts.</p>
                    </div>
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-primary hover:underline font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">Loading notifications...</div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 hover:bg-slate-50 transition-colors flex gap-4 ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notification.read ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                                        {getIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`text-sm font-semibold ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{notification.message}</p>

                                        <div className="flex gap-4 mt-3">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" /> Mark as read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="text-xs font-medium text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    </div>

                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-2"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">No notifications</h3>
                            <p>You're all caught up! Check back later for updates.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
