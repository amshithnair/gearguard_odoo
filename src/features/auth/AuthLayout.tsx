import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
    return (
        <div className="min-h-screen w-full bg-gray-50 text-slate-900 flex items-center justify-center p-4">
            {/* Simple clean light layout */}
            <div className="w-full max-w-md">
                <Outlet />
            </div>
        </div>
    );
};
