import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    // If not loading, check if user exists and is an admin
    // If not admin, redirect (e.g., to home or show an unauthorized page)
    return user && user.isAdmin ? children : <Navigate to="/" replace state={{ from: location }} />;
    // Or display an 'Unauthorized' component: return user && user.isAdmin ? children : <UnauthorizedPage />;
};

export default AdminRoute;
