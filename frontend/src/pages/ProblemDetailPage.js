import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import CodeEditor from '../components/CodeEditor';

const LANGUAGES = ['python', 'java', 'cpp', 'javascript'];

const ProblemDetailPage = () => {
    const { id: problemId } = useParams();
    const { user } = useAuth(); // Get user info for enabling run/submit

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Code Execution State
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]); // Default to python
    const [code, setCode] = useState('');
    const [customInput, setCustomInput] = useState('');
    const [runResult, setRunResult] = useState(null); // { output: string, error: string, executionTime: number }
    const [runLoading, setRunLoading] = useState(false);
    const [runError, setRunError] = useState('');

    // Submission State
    const [submitResult, setSubmitResult] = useState(null); // Full submission object from backend
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Past Submissions State
    const [pastSubmissions, setPastSubmissions] = useState([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [submissionsError, setSubmissionsError] = useState('');


    // Fetch problem details
    const fetchProblem = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/api/questions/${problemId}`);
            setProblem(data);
            // Initial code from template based on default language
            setCode(data.templateCode?.[selectedLanguage] || '');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load problem details.');
            console.error("Fetch problem error:", err);
        } finally {
            setLoading(false);
        }
    }, [problemId, selectedLanguage]); // No Refetch if language changes, only for initial load.

    // Fetch past submissions
    const fetchSubmissions = useCallback(async () => {
        if (!user) return; // Don't fetch if not logged in
        setSubmissionsLoading(true);
        setSubmissionsError('');
        try {
            const { data } = await api.get(`/api/submissions/user/question/${problemId}`);
            setPastSubmissions(data);
        } catch (err) {
            setSubmissionsError(err.response?.data?.message || 'Failed to load past submissions.');
            console.error("Fetch submissions error:", err);
        } finally {
            setSubmissionsLoading(false);
        }
    }, [problemId, user]); // Depend on problemId and user


    useEffect(() => {
        fetchProblem();
        fetchSubmissions(); // Fetching submissions when component mounts or problem/user changes
    }, [fetchProblem, fetchSubmissions]); // Using the callback functions in dependency array


    // Update code in editor when language changes
    useEffect(() => {
        if (problem) {
            setCode(problem.templateCode?.[selectedLanguage] || '');
        }
    }, [selectedLanguage, problem]);


    const handleRunCode = async () => {
        if (!user) {
            setRunError("Please log in to run code.");
            return;
        }
        setRunLoading(true);
        setRunError('');
        setRunResult(null); // Clear previous results
        try {
            const payload = {
                questionId: problemId,
                language: selectedLanguage,
                code,
                customInput
            };
            const { data } = await api.post('/api/submissions/run', payload);
            setRunResult(data); // { output, error, executionTime }
        } catch (err) {
            setRunError(err.response?.data?.message || 'An error occurred while running the code.');
            console.error("Run code error:", err);
        } finally {
            setRunLoading(false);
        }
    };

    const handleSubmitCode = async () => {
        if (!user) {
            setSubmitError("Please log in to submit code.");
            return;
        }
        setSubmitLoading(true);
        setSubmitError('');
        setSubmitResult(null);
        try {
            const payload = {
                questionId: problemId,
                language: selectedLanguage,
                code,
            };
            const { data } = await api.post('/api/submissions/submit', payload);
            setSubmitResult(data); // Full submission object
            // Refreshing past submissions after successful submit
            fetchSubmissions();
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'An error occurred during submission.');
            console.error("Submit code error:", err);
        } finally {
            setSubmitLoading(false);
        }
    };


    if (loading) return <div className="container"><LoadingSpinner /></div>;
    if (error) return <div className="container alert alert-danger">{error}</div>;
    if (!problem) return <div className="container">Problem not found.</div>;

    return (
        <div className="container">
            <div className="problem-detail">
                <h1>{problem.questionNumber}. {problem.name}</h1>
                <div className="meta">
                    <span className={`difficulty-${problem.difficulty}`}>{problem.difficulty}</span>
                    {problem.tags?.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
                <ReactMarkdown>{problem.description || ''}</ReactMarkdown>

                <h3>Sample Test Cases</h3>
                {problem.sampleTestCases?.map((tc, index) => (
                    <div key={index} className="test-cases">
                        <p><strong>Input:</strong></p>
                        <pre><code>{tc.input}</code></pre>
                        <p><strong>Output:</strong></p>
                        <pre><code>{tc.output}</code></pre>
                    </div>
                ))}
            </div>

            {/* Code Editor and Execution Area */}
            {user ? (
                <div className="editor-area">
                    <div className="editor-controls">
                        <div>
                            <label htmlFor="language-select" style={{ marginRight: '0.5rem' }}>Language:</label>
                            <select
                                id="language-select"
                                className="language-select"
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <button onClick={handleRunCode} className="btn btn-secondary" disabled={runLoading}>
                                {runLoading ? 'Running...' : 'Run Code'}
                            </button>
                            <button onClick={handleSubmitCode} className="btn btn-success" disabled={submitLoading}>
                                {submitLoading ? 'Submitting...' : 'Submit Code'}
                            </button>
                        </div>
                    </div>

                    <CodeEditor
                        language={selectedLanguage}
                        value={code}
                        onChange={(newCode) => setCode(newCode)}
                    />

                    {/* Custom Input Area */}
                    <div className="custom-input-area form-group" style={{ marginTop: '1rem' }}>
                        <label htmlFor="custom-input">Custom Input (for Run Code):</label>
                        <textarea
                            id="custom-input"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="Enter custom input here..."
                        />
                    </div>

                    {/* Run Code Output */}
                    {runError && <div className="alert alert-danger" style={{ marginTop: '1rem' }}>{runError}</div>}
                    {runResult && (
                        <div className="output-area">
                            <h4>Run Output (Custom Input)</h4>
                            {runResult.error ? (
                                <pre><code className="error">{runResult.error}</code></pre>
                            ) : (
                                <pre><code>{runResult.output ?? ''}</code></pre>
                            )}
                            {runResult.executionTime && <p><small>Execution Time: {runResult.executionTime} ms</small></p>}
                        </div>
                    )}


                    {/* Submission Result */}
                    {submitError && <div className="alert alert-danger" style={{ marginTop: '1rem' }}>{submitError}</div>}
                    {submitLoading && <p style={{ marginTop: '1rem' }}>Submitting and judging...</p>}
                    {submitResult && (
                        <div className={`submission-result ${submitResult.status.replace(/\s+/g, '')}`}> {/* Accepted, WrongAnswer etc. */}
                            <h4>Submission Result: {submitResult.status}</h4>
                            {/* Display detailed results per test case if available */}
                            {submitResult.results && submitResult.results.length > 0 && (
                                <div>
                                    <h5>Test Case Details:</h5>
                                    {submitResult.results.map((res, index) => (
                                        <div key={index} className="test-case-result">
                                            <strong>Case {index + 1}:</strong>{' '}
                                            <span className={`status-${res.status === 'Passed' ? 'Passed' : 'Failed'}`}>
                                                {res.status}
                                            </span>
                                            {res.status !== 'Passed' && res.error && <small style={{ color: '#721c24' }}> ({res.error})</small>}
                                            {/* Optionally show input/output/expected for failed cases - be careful with large data */}
                                            {/* {res.status !== 'Passed' && (
                                             <pre><code>Input: {problem.hiddenTestCases[res.testCaseIndex].input}\nExpected: {res.expectedOutput}\nGot: {res.output || 'N/A'}</code></pre>
                                         )} */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            ) : (
                <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
                    <Link to="/login" state={{ from: window.location.pathname }}>Log in</Link> or <Link to="/signup">Sign up</Link> to run or submit code.
                </div>
            )}


            {/* Past Submissions */}
            {user && (
                <div className="past-submissions" style={{ marginTop: '2rem' }}>
                    <h3>Your Past Submissions for this Problem</h3>
                    {submissionsLoading && <LoadingSpinner />}
                    {submissionsError && <div className="alert alert-danger">{submissionsError}</div>}
                    {!submissionsLoading && !submissionsError && (
                        pastSubmissions.length > 0 ? (
                            <ul>
                                {pastSubmissions.map(sub => (
                                    <li key={sub._id}>
                                        {new Date(sub.submittedAt).toLocaleString()} - {sub.language} -
                                        <strong className={`status-${sub.status === 'Accepted' ? 'solved' : sub.status === 'Pending' || sub.status === 'Running' ? 'unattempted' : 'attempted'}`}> {sub.status} </strong>
                                        {/* Optionally add a link to view the full submission details */}
                                        {/* <Link to={`/submission/${sub._id}`}>View Details</Link> */}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>You haven't made any submissions for this problem yet.</p>
                        )
                    )}
                </div>
            )}

        </div>
    );
};

export default ProblemDetailPage;
