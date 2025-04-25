import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const HomePage = () => {
    const { user } = useAuth();

    return (
        <div className="container">
            <h1>Welcome to CodePlatform</h1>
            <p>Practice your coding skills, solve problems, and track your progress.</p>
            <p>Anyone can view problem details. Sign in to run code, submit solutions, and view the full problem list.</p>
            <div>
                {/* Example: Show a prominent link to Problems list if logged in */}
                {user ? (
                    <Link to="/problems" className="btn btn-primary">View Problems</Link>
                ) : (
                    <Link to="/login" className="btn btn-primary">Login to Start</Link>
                )}
                {/* can add links to specific featured problems here later */}
                {/* <Link to="/problem/1" className="btn btn-secondary">View Problem 1</Link> */}
            </div>
        </div>
    );
};

export default HomePage;
