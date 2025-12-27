import { Outlet } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { UserCircle2, Bell, Settings } from 'lucide-react';
import { useStore } from '../../stores/useStore';

export const Layout = () => {
    const { currentUser } = useStore();

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 font-sans selection:bg-blue-100">

            {/* Top Bar (Brand + User + Actions) - Light Mode */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20 relative">
                <div className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-sm text-white font-display">G</div>
                    GearGuard
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-slate-500 hover:text-blue-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
                        <Bell className="w-5 h-5" />
                    </button>
                    <button className="text-slate-500 hover:text-blue-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <span className="text-sm font-semibold text-slate-700">{currentUser?.name || 'User'}</span>
                        {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" />
                        ) : (
                            <UserCircle2 className="w-8 h-8 text-slate-400" />
                        )}
                    </div>
                </div>
            </header>

            {/* Navigation Tabs - Light Mode */}
            <div className="bg-white border-b border-gray-200 shadow-sm z-10 relative">
                <TopNavbar />
            </div>

            <main className="w-full">
                <div className="max-w-[1920px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
