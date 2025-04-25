import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // Use the centralized api service

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Initially loading user state

    // Effect to load user from localStorage on initial mount
    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('userInfo')
                ? JSON.parse(localStorage.getItem('userInfo')).token
                : null;

            if (storedToken) {
                // Set the auth token for future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    // Verifying token by fetching user data
                    const { data } = await api.get('/api/auth/me');
                    setUser(data); // Set user if token is valid
                } catch (error) {
                    console.error("Failed to fetch user with stored token", error);
                    localStorage.removeItem('userInfo'); // Removing invalid token info
                    delete api.defaults.headers.common['Authorization'];
                    setUser(null);
                }
            }
            setLoading(false); // Finished loading attempt
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`; // Set auth header
            setUser(data);
            return data; // Return user data on success
        } catch (error) {
            console.error("Login failed:", error.response ? error.response.data : error.message);
            // Rethrowing the error so the component can handle it (e.g., display message)
            throw error.response ? new Error(error.response.data.message) : error;
        }
    };

    const signup = async (name, email, password) => {
        try {
            const { data } = await api.post('/api/auth/register', { name, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`; // Set auth header
            setUser(data);
            return data;
        } catch (error) {
            console.error("Signup failed:", error.response ? error.response.data : error.message);
            throw error.response ? new Error(error.response.data.message) : error;
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        delete api.defaults.headers.common['Authorization']; // Remove auth header
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
