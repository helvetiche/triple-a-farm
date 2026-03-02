"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    User,
    Lock,
    Settings,
    CheckCircle,
    AlertCircle
} from "lucide-react"

interface SettingsNavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    status?: 'active' | 'warning' | 'success';
}

const getSettingsNavItems = (): SettingsNavItem[] => {
    const baseUrl = "/admin/settings";

    return [
        {
            title: 'General',
            href: `${baseUrl}`,
            icon: User,
            description: 'Manage your farm information and contact details',
            status: 'active'
        },
        {
            title: 'Password',
            href: `${baseUrl}/password`,
            icon: Lock,
            description: 'Update your password and security settings',
            status: 'success'
        }
    ];
};

export function SettingsNav() {
    const pathname = usePathname();
    const settingsNavItems = getSettingsNavItems();

    const getStatusColor = (status?: 'active' | 'warning' | 'success') => {
        switch (status) {
            case 'warning':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'success':
                return 'text-[#3d6c58] bg-[#3d6c58]/10 border-[#3d6c58]/20';
            default:
                return 'text-[#3d6c58] bg-[#3d6c58]/10 border-[#3d6c58]/20';
        }
    };

    const getStatusIcon = (status?: 'active' | 'warning' | 'success') => {
        switch (status) {
            case 'warning':
                return <AlertCircle className="w-4 h-4" />;
            case 'success':
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <Settings className="w-4 h-4" />;
        }
    };

    return (
                <div className="space-y-6">
                    {/* Navigation Items */}
                    <nav className="space-y-2">
                        {settingsNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={`group relative block p-4 transition-all duration-200 ${
                                        isActive
                                            ? 'bg-[#3d6c58]/10'
                                            : 'bg-white border hover:border-[#3d6c58]/30 hover:bg-[#3d6c58]/5'
                                    }`}
                                    style={{ borderRadius: 0 }}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`font-medium text-sm ${
                                                    isActive ? 'text-[#1f3f2c]' : 'text-gray-900'
                                                }`}>
                                                    {item.title}
                                                </h4>
                                                {item.status && (
                                                    <div className="p-1 text-[#3d6c58]">
                                                        {getStatusIcon(item.status)}
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-xs ${
                                                isActive ? 'text-[#4a6741]' : 'text-gray-600'
                                            }`}>
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* Active Indicator */}
                                        {isActive && (
                                            <div className="absolute top-0 right-0 w-2 h-full bg-[#3d6c58]" style={{ borderRadius: '0 4px 4px 0' }}></div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
    );
}
