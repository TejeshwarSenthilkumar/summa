
import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { QrCode, ClipboardList, Package, User } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const PharmacistLayout = () => {
    const location = useLocation();

    const tabs = [
        { path: '/pharmacist/scan', icon: QrCode, label: 'Scan' },
        { path: '/pharmacist/stock', icon: Package, label: 'Stock' },
        { path: '/pharmacist/history', icon: ClipboardList, label: 'History' },
        { path: '/pharmacist/profile', icon: User, label: 'Profile' },
    ];

    // Check if we are in the Dispense flow (which behaves like a sub-page of Scan)
    // If so, we might want to keep the 'Scan' tab active or hide the nav if strictly requested.
    // However, user said "Navbar must NEVER disappear".
    // "Scan" tab should probably be active even when in /dispense.
    const getActiveTab = (path) => {
        if (location.pathname.includes('/pharmacist/dispense')) return '/pharmacist/scan';
        return path;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Top Bar - Minimal */}
            <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <Logo size="sm" />
                <span className="text-xs font-medium text-slate-400">POS v2.0</span>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="bg-white border-t border-slate-200 fixed bottom-0 w-full z-50 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = getActiveTab(tab.path) === tab.path || location.pathname === tab.path;

                        return (
                            <NavLink
                                key={tab.path}
                                to={tab.path}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{tab.label}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default PharmacistLayout;
