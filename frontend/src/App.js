import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Layout & Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import LoadingSpinner from './components/LoadingSpinner'; // Optional: for auth loading state

// Pages (Lazy load pages for better performance)
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const ProblemListPage = React.lazy(() => import('./pages/ProblemListPage'));
const ProblemDetailPage = React.lazy(() => import('./pages/ProblemDetailPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));


function App() {
    return (
        <Router>
            <Navbar />
            <React.Suspense fallback={<div className="container"><LoadingSpinner /></div>}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    {/* Anyone can view a specific problem detail page */}
                    <Route path="/problem/:id" element={<ProblemDetailPage />} />

                    {/* Private Routes (Require Login) */}
                    <Route path="/problems" element={
                        <PrivateRoute>
                            <ProblemListPage />
                        </PrivateRoute>
                    } />
                    {/* Note: ProblemDetailPage interaction (run/submit) is handled internally based on auth status */}


                    {/* Admin Routes (Require Login + Admin Role) */}
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminDashboardPage />
                        </AdminRoute>
                    } />


                    {/* Catch-all Not Found Route */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </React.Suspense>
        </Router>
    );
}

export default App;
