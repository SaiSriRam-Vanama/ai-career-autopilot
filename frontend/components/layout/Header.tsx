'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Bell, LogOut, Settings } from 'lucide-react';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
            <div>
                <h2 className="text-xl font-semibold">
                    Welcome back, {user?.full_name?.split(' ')[0] || 'User'}! 👋
                </h2>
                <p className="text-sm text-muted-foreground">
                    Let's continue your career journey
                </p>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Link href="/dashboard/notifications" className="p-2 rounded-lg hover:bg-muted transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                </Link>

                {/* Settings */}
                <Link href="/dashboard/settings" className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Settings className="w-5 h-5" />
                </Link>

                {/* User Menu */}
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                    <div className="text-right">
                        <p className="text-sm font-medium">{user?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
