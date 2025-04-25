import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login after logout
    };

    return (
        <nav className="navbar">
            <Link to="/" className="brand">
                CodePlatform
            </Link>
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                {user && <li><Link to="/problems">Problems</Link></li>}
                {user && user.isAdmin && <li><Link to="/admin">Admin</Link></li>}
                {user ? (
                    <>
                        <li><span>Welcome, {user.name}</span></li>
                        <li><button onClick={handleLogout}>Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
