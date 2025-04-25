import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1>404 - Page Not Found</h1>
            <p>Oops! The page you are looking for does not exist.</p>
            <Link to="/" className="btn btn-primary">Go to Home</Link>
        </div>
    );
};

export default NotFoundPage;
