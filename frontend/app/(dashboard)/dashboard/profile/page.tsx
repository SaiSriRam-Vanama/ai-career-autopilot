'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
    const { user, logout } = useAuth();

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account and preferences.
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="h-32 gradient-primary"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6">
                        <div className="w-32 h-32 rounded-full border-4 border-card bg-background flex items-center justify-center text-4xl font-bold text-primary">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                            <div className="mt-2 flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                                <User className="w-5 h-5 text-muted-foreground" />
                                <span className="font-medium">{user?.full_name}</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                            <div className="mt-2 flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                                <span className="font-medium">{user?.email}</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account ID</label>
                            <div className="mt-2 flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 font-mono text-sm">
                                <Shield className="w-5 h-5 text-muted-foreground" />
                                <span>{user?.id}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <Button variant="destructive" className="w-full" onClick={logout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
