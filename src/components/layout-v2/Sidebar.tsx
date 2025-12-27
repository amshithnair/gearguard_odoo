import { Link, useLocation } from 'react-router-dom';
import { useLiveQuery } from '@electric-sql/pglite-react';
import { db } from '../../db/client';
import {
    LayoutDashboard,
    MessageSquare,
    Calendar,
    AlertTriangle,
    BarChart3,
    Wrench,
    Factory,
    Users,
    Package,
    ShieldCheck,
    Settings,
    Box,
    Activity
} from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar = () => {
    const location = useLocation();

    // Live Query for Teams (Channels)
    const teams = useLiveQuery<{ id: string, name: string, slug: string }>(
        'SELECT id, name, slug FROM teams ORDER BY name ASC'
    );

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);
    const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
        <Link to={to} className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            isActive(to) ? "bg-blue-600 text-white font-medium" : "hover:bg-white/5 text-slate-400 hover:text-slate-100"
        )}>
            <Icon className="w-4 h-4" />
            {label}
        </Link>
    );

    return (
        <div className="w-[260px] bg-slate-900 h-screen flex flex-col text-slate-300">
            {/* Header */}
            <div className="h-14 flex items-center px-4 font-bold text-white tracking-tight text-lg border-b border-white/10 shadow-sm">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 font-display">G</div>
                GearGuard
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">

                {/* 1. Operaional (Frames 1, 3, 4, 6, 7) */}
                <div>
                    <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Operations</h3>
                    <div className="space-y-1">
                        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                        <NavItem to="/channels/mechanical" icon={MessageSquare} label="Maintenance Feed" />
                        <NavItem to="/calendar" icon={Calendar} label="Calendar" />
                        <NavItem to="/reporting" icon={BarChart3} label="Reporting" />
                        <NavItem to="/alerts" icon={AlertTriangle} label="Alerts" />
                    </div>
                </div>

                {/* 2. Management (Frames 2, 5, 8, 9) */}
                <div>
                    <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Management</h3>
                    <div className="space-y-1">
                        <NavItem to="/master/equipment" icon={Wrench} label="Equipment" />
                        <NavItem to="/master/equipment/categories" icon={Box} label="Categories" />
                        <NavItem to="/master/work-centers" icon={Factory} label="Work Centers" />
                        <NavItem to="/master/inventory" icon={Package} label="Inventory" />
                        <NavItem to="/master/teams" icon={Users} label="Teams & Techs" />
                        <NavItem to="/admin/users" icon={ShieldCheck} label="Users & Roles" />
                        <div className="pt-4 mt-4 border-t border-white/10">
                            <NavItem to="/simulation/telemetry" icon={Activity} label="Telemetry Simulator" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer (Frame 10) */}
            <div className="p-4 border-t border-white/10">
                <Link to="/settings" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Settings</span>
                </Link>
            </div>
        </div>
    );
};
