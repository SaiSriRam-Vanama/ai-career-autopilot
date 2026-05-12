'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    FileText,
    Map,
    Briefcase,
    MessageSquare,
    User,
    TrendingUp
} from 'lucide-react';
import Logo from '../Logo';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Resume', href: '/dashboard/resume', icon: FileText },
    { name: 'Roadmap', href: '/dashboard/roadmap', icon: Map },
    { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
    { name: 'AI Advisor', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col">
            <div className="p-6 border-b border-border">
                <Logo />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'hover:bg-muted text-foreground'
                                }
              `}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <div className="p-4 rounded-lg glass">
                    <p className="text-sm font-semibold mb-1">Need Help?</p>
                    <p className="text-xs text-muted-foreground mb-3">
                        Chat with our AI advisor
                    </p>
                    <Link
                        href="/dashboard/chat"
                        className="text-xs text-primary hover:underline font-medium"
                    >
                        Start Chat →
                    </Link>
                </div>
            </div>
        </aside>
    );
}
