import { useStore } from '../../stores/useStore';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const RequireAuth = () => {
    const { currentUser } = useStore();
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
