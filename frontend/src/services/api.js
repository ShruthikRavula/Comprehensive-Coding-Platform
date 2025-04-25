import axios from 'axios';

// Axios instance creating
const api = axios.create({
    // The 'proxy' setting in package.json handles the base URL during development
    // For production, might need to set baseURL explicitly:
    // baseURL: process.env.REACT_APP_API_URL || 'http://production-api-url.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token (if available)
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo')
            ? JSON.parse(localStorage.getItem('userInfo'))
            : null;

        if (userInfo && userInfo.token) {
            config.headers['Authorization'] = `Bearer ${userInfo.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response, // Simply return response if successful
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle 401 Unauthorized: e.g., logout user, redirect to login
            console.error('Unauthorized access - 401');
            // Example: Force logout if token is invalid/expired
            // This depends on how structure logout logic (e.g., calling a context method)
            // localStorage.removeItem('userInfo');
            // window.location.href = '/login'; // Force redirect
        }
        // Important: return the promise rejection so individual calls can handle specific errors
        return Promise.reject(error);
    }
);


export default api;
