import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const WorkspaceLayout = () => {
    return (
        <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
            {/* Sidebar (Left Panel) */}
            <div className="shrink-0 z-20 shadow-xl">
                <Sidebar />
            </div>

            {/* Main Content Area (Dynamic: Feed Or Master Lists) */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full relative">
                <Outlet />
            </div>
        </div>
    );
};
