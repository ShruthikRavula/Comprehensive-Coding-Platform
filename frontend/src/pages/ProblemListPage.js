import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ProblemListPage = () => {
    const [problems, setProblems] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState(''); // All
    const [statusFilter, setStatusFilter] = useState(''); // All
    const [tagFilter, setTagFilter] = useState(''); // All

    // Fetching problems and tags
    const fetchProblemsAndTags = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Construct query parameters
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (difficultyFilter) params.difficulty = difficultyFilter;
            if (statusFilter) params.status = statusFilter;
            if (tagFilter) params.tags = tagFilter; // Send single tag for now, backend handles it

            // Fetching problems with filters
            const problemsRes = await api.get('/api/questions', { params });
            setProblems(problemsRes.data);

            // Fetching all unique tags only once or when needed
            if (allTags.length === 0) {
                const tagsRes = await api.get('/api/tags');
                setAllTags(tagsRes.data);
            }

        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError(err.response?.data?.message || 'Failed to load problems or tags. Please try again.');
            setProblems([]); // Clear problems on error
        } finally {
            setLoading(false);
        }
    }, [searchTerm, difficultyFilter, statusFilter, tagFilter, allTags.length]); // Re-run fetch when filters change


    // Initial fetch on component mount
    useEffect(() => {
        fetchProblemsAndTags();
    }, [fetchProblemsAndTags]); // Dependency array includes the memoized fetch function

    const handleFilterChange = () => {
        // The fetchProblemsAndTags function is called automatically
        // by the useEffect hook when the filter state variables change.
        // No need for a separate button click here, filters apply on change.
        // If you prefer a button, add one and call fetchProblemsAndTags onClick.
    };

    const getStatusClassName = (status) => {
        switch (status) {
            case 'Solved': return 'status-solved';
            case 'Attempted': return 'status-attempted';
            default: return 'status-unattempted';
        }
    };

    return (
        <div className="container">
            <h2>All Problems</h2>

            {/* Filter Controls */}
            <div className="filters">
                <div className="form-group">
                    <label htmlFor="search">Search</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Search by name, number, keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    // onChange triggers re-fetch via useEffect dependency
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="difficulty">Difficulty</label>
                    <select
                        id="difficulty"
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="Solved">Solved</option>
                        <option value="Attempted">Attempted</option>
                        <option value="Unattempted">Unattempted</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="tags">Tag</label>
                    <select
                        id="tags"
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        {allTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>
                {/* Optional: button to apply filters manually if needed */}
                {/* <button onClick={handleFilterChange} className="btn btn-light">Apply Filters</button> */}
            </div>


            {loading && <LoadingSpinner />}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <table className="problems-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Difficulty</th>
                            <th>Status</th>
                            <th>Tags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems.length > 0 ? (
                            problems.map((problem) => (
                                <tr key={problem._id}>
                                    <td>{problem.questionNumber}</td>
                                    <td>
                                        <Link to={`/problem/${problem._id}`}>{problem.name}</Link>
                                    </td>
                                    <td>
                                        <span className={`difficulty-${problem.difficulty}`}>{problem.difficulty}</span>
                                    </td>
                                    <td>
                                        <span className={getStatusClassName(problem.userStatus)}>{problem.userStatus}</span>
                                    </td>
                                    <td>
                                        {problem.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No problems found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ProblemListPage;
