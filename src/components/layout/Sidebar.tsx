import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    Wrench,
    Calendar,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    BarChart3, // Reporting
    Users,     // Teams
    AlertTriangle, // Alerts
    Factory,   // Master Data
    Package
} from 'lucide-react';
import { useStore } from '../../stores/useStore';
import { clsx } from 'clsx';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = () => {
    const { currentUser, logout } = useStore();
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Kanban Board', icon: ClipboardList, path: '/kanban' },
        { label: 'Equipment', icon: Wrench, path: '/equipment' },
        { label: 'Schedule', icon: Calendar, path: '/calendar' },
        { label: 'Reporting', icon: BarChart3, path: '/reporting' },
        { label: 'Alerts', icon: AlertTriangle, path: '/alerts' },

        // Master Data Group
        { label: 'Inventory', icon: Package, path: '/master/inventory' },
        { label: 'Teams', icon: Users, path: '/teams' },
        { label: 'Work Centers', icon: Factory, path: '/master/work-centers' }, // Using Work Center link

        { label: 'Simulation (Pulse)', icon: ClipboardList, path: '/simulation' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <motion.aside
            initial={{ width: 260 }}
            animate={{ width: collapsed ? 80 : 260 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-screen sticky top-0 p-4 shrink-0 flex flex-col z-50 bg-background/50 backdrop-blur-xl border-r border-border/40"
        >
            {/* Brand Section */}
            <div className={clsx("flex items-center gap-3 mb-8 px-2 transition-all", collapsed ? 'justify-center' : '')}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                    <Wrench className="w-6 h-6" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="overflow-hidden"
                        >
                            <h1 className="text-xl font-bold font-display tracking-tight text-foreground">GearGuard</h1>
                            <p className="text-xs text-muted-foreground font-medium">Maintenance Pro</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation List */}
            <nav className="space-y-2 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group relative",
                                isActive
                                    ? "text-primary-600 font-semibold bg-primary-50 dark:bg-primary-900/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={clsx("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary-600" : "group-hover:text-foreground")} />

                                {!collapsed && (
                                    <span className="whitespace-nowrap">{item.label}</span>
                                )}

                                {/* Active Indicator Splash */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-2xl -z-10 border border-primary-100 dark:border-primary-800/30"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Toggle & User Profile */}
            <div className="mt-auto space-y-4">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <div className={clsx("flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50 shadow-sm", collapsed ? "justify-center p-2" : "")}>
                    <img
                        src={currentUser?.avatar}
                        alt="User"
                        className="w-9 h-9 rounded-full object-cover border border-border"
                    />
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{currentUser?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{currentUser?.role}</p>
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={logout}
                            className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.aside>
    );
};
