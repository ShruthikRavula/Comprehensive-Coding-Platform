import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    console.log("location", location);

    if (loading) {
        // Showing loading indicator while checking auth state
        return <LoadingSpinner />;
    }

    // If not loading and no user, redirect to login
    // Storing the intended location to redirect back after login
    return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

export default PrivateRoute;