import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const navItems = [
    { label: 'Maintenance Board', path: '/kanban' },
    { label: 'Dashboard', path: '/' },
    { label: 'Maintenance Calendar', path: '/calendar' },
    { label: 'Equipment', path: '/equipment' },
    { label: 'Reporting', path: '/reporting' },
    { label: 'Teams', path: '/teams' },
];

export const TopNavbar = () => {
    const location = useLocation();

    return (
        <nav className="w-full">
            <div className="max-w-[1920px] mx-auto px-6">
                <div className="flex items-center h-12 gap-8 overflow-x-auto no-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className="relative h-full flex items-center group px-1"
                            >
                                <span className={clsx(
                                    "text-sm font-medium transition-colors whitespace-nowrap z-10",
                                    isActive ? "text-blue-600 font-semibold" : "text-slate-500 group-hover:text-slate-800"
                                )}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="nav-underline"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
