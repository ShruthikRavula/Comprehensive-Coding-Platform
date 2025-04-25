import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom'; // Use Link for editing

// Initial structure for a new test case pair
const newTestCase = () => ({ input: '', output: '' });
// Initial structure for template code
const initialTemplateCode = () => ({ python: '', java: '', cpp: '', javascript: '' });

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [errorQuestions, setErrorQuestions] = useState('');

    // Form state for adding/editing
    const [isEditing, setIsEditing] = useState(false);
    const [currentQuestionId, setCurrentQuestionId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        difficulty: 'Easy',
        tags: '', // Comma-separated string for input
        sampleTestCases: [newTestCase()],
        hiddenTestCases: [newTestCase()],
        templateCode: initialTemplateCode(),
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');


    // Fetch existing questions for listing/editing
    const fetchAdminQuestions = async () => {
        setLoadingQuestions(true);
        setErrorQuestions('');
        try {
            // Use the same endpoint as users, but admin doesn't need status filter
            const { data } = await api.get('/api/questions');
            setQuestions(data.sort((a, b) => a.questionNumber - b.questionNumber)); // Ensure sorted
        } catch (err) {
            setErrorQuestions(err.response?.data?.message || 'Failed to load questions.');
            console.error("Fetch admin questions error:", err);
        } finally {
            setLoadingQuestions(false);
        }
    };

    useEffect(() => {
        fetchAdminQuestions();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTemplateCodeChange = (e, lang) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            templateCode: { ...prev.templateCode, [lang]: value }
        }));
    };

    const handleTestCaseChange = (e, index, type, field) => { // type: 'sample' or 'hidden'
        const { value } = e.target;
        const cases = type === 'sample' ? [...formData.sampleTestCases] : [...formData.hiddenTestCases];
        cases[index][field] = value;
        if (type === 'sample') {
            setFormData(prev => ({ ...prev, sampleTestCases: cases }));
        } else {
            setFormData(prev => ({ ...prev, hiddenTestCases: cases }));
        }
    };

    const addTestCase = (type) => {
        if (type === 'sample') {
            setFormData(prev => ({ ...prev, sampleTestCases: [...prev.sampleTestCases, newTestCase()] }));
        } else {
            setFormData(prev => ({ ...prev, hiddenTestCases: [...prev.hiddenTestCases, newTestCase()] }));
        }
    };

    const removeTestCase = (index, type) => {
        let cases;
        if (type === 'sample') {
            cases = formData.sampleTestCases.filter((_, i) => i !== index);
            if (cases.length === 0) cases = [newTestCase()]; // Ensure at least one
            setFormData(prev => ({ ...prev, sampleTestCases: cases }));
        } else {
            cases = formData.hiddenTestCases.filter((_, i) => i !== index);
            if (cases.length === 0) cases = [newTestCase()]; // Ensure at least one
            setFormData(prev => ({ ...prev, hiddenTestCases: cases }));
        }
    };


    const resetForm = () => {
        setIsEditing(false);
        setCurrentQuestionId(null);
        setFormData({
            name: '',
            description: '',
            difficulty: 'Easy',
            tags: '',
            sampleTestCases: [newTestCase()],
            hiddenTestCases: [newTestCase()],
            templateCode: initialTemplateCode(),
        });
        setFormError('');
        setFormSuccess('');
    };

    const handleEditClick = (question) => {
        setIsEditing(true);
        setCurrentQuestionId(question._id);
        setFormData({
            name: question.name,
            description: question.description,
            difficulty: question.difficulty,
            tags: question.tags.join(', '), // Join tags array into string for input
            sampleTestCases: question.sampleTestCases.length > 0 ? question.sampleTestCases : [newTestCase()],
            hiddenTestCases: question.hiddenTestCases.length > 0 ? question.hiddenTestCases : [newTestCase()],
            templateCode: { // Ensure all keys exist, defaulting to empty string
                python: question.templateCode?.python || '',
                java: question.templateCode?.java || '',
                cpp: question.templateCode?.cpp || '',
                javascript: question.templateCode?.javascript || '',
            }
        });
        setFormError('');
        setFormSuccess('');
        window.scrollTo(0, 0); // Scroll to form at top
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        setFormSuccess('');

        // Prepare payload
        const payload = {
            ...formData,
            // Converting comma-separated tags string back to array, trimming whitespace
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            // Filtering out empty test cases just before sending
            sampleTestCases: formData.sampleTestCases.filter(tc => tc.input || tc.output),
            hiddenTestCases: formData.hiddenTestCases.filter(tc => tc.input || tc.output),
        };

        // Basic validation: Ensure at least one hidden test case
        if (payload.hiddenTestCases.length === 0) {
            setFormError('At least one hidden test case is required.');
            setFormLoading(false);
            return;
        }


        try {
            if (isEditing) {
                // Update existing question
                await api.put(`/api/questions/${currentQuestionId}`, payload);
                setFormSuccess('Question updated successfully!');
            } else {
                // Add new question
                await api.post('/api/questions', payload);
                setFormSuccess('Question added successfully!');
            }
            resetForm(); // Clear form after success
            fetchAdminQuestions(); // Refresh the list
        } catch (err) {
            setFormError(err.response?.data?.message || 'An error occurred.');
            console.error("Form submission error:", err);
        } finally {
            setFormLoading(false);
        }
    };


    return (
        <div className="container">
            <h2>Admin Dashboard</h2>

            {/* Add/Edit Question Form */}
            <div className="admin-form" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
                <h3>{isEditing ? 'Edit Question' : 'Add New Question'}</h3>
                {formError && <div className="alert alert-danger">{formError}</div>}
                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <div className="form-group">
                        <label htmlFor="name">Question Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description (Markdown supported)</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required rows="6"></textarea>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="difficulty">Difficulty</label>
                            <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleInputChange} required>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 2 }}>
                            <label htmlFor="tags">Tags (comma-separated)</label>
                            <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g., dp, array, sorting" />
                        </div>
                    </div>

                    {/* Sample Test Cases */}
                    <div className="form-group">
                        <label>Sample Test Cases</label>
                        {formData.sampleTestCases.map((tc, index) => (
                            <div key={index} className="test-case-pair">
                                <textarea placeholder={`Input ${index + 1}`} value={tc.input} onChange={(e) => handleTestCaseChange(e, index, 'sample', 'input')} />
                                <textarea placeholder={`Output ${index + 1}`} value={tc.output} onChange={(e) => handleTestCaseChange(e, index, 'sample', 'output')} />
                                {formData.sampleTestCases.length > 1 && <button type="button" onClick={() => removeTestCase(index, 'sample')} className="btn btn-danger btn-sm">Remove</button>}
                            </div>
                        ))}
                        <button type="button" onClick={() => addTestCase('sample')} className="btn btn-light btn-sm">Add Sample Case</button>
                    </div>

                    {/* Hidden Test Cases */}
                    <div className="form-group">
                        <label>Hidden Test Cases (Required)</label>
                        {formData.hiddenTestCases.map((tc, index) => (
                            <div key={index} className="test-case-pair">
                                <textarea placeholder={`Input ${index + 1}`} value={tc.input} onChange={(e) => handleTestCaseChange(e, index, 'hidden', 'input')} required={index === 0} /> {/* Require at least the first */}
                                <textarea placeholder={`Output ${index + 1}`} value={tc.output} onChange={(e) => handleTestCaseChange(e, index, 'hidden', 'output')} required={index === 0} />
                                {formData.hiddenTestCases.length > 1 && <button type="button" onClick={() => removeTestCase(index, 'hidden')} className="btn btn-danger btn-sm">Remove</button>}
                            </div>
                        ))}
                        <button type="button" onClick={() => addTestCase('hidden')} className="btn btn-light btn-sm">Add Hidden Case</button>
                    </div>

                    {/* Template Code */}
                    <div className="form-group template-code">
                        <label>Template Code</label>
                        {Object.keys(formData.templateCode).map(lang => (
                            <div key={lang} style={{ marginBottom: '0.5rem' }}>
                                <label htmlFor={`template-${lang}`} style={{ textTransform: 'capitalize', fontWeight: 'normal' }}>{lang}</label>
                                <textarea
                                    id={`template-${lang}`}
                                    name={`template-${lang}`}
                                    value={formData.templateCode[lang]}
                                    onChange={(e) => handleTemplateCodeChange(e, lang)}
                                    placeholder={`Enter default ${lang} code here...`}
                                />
                            </div>
                        ))}
                    </div>


                    <button type="submit" className="btn btn-primary" disabled={formLoading}>
                        {formLoading ? 'Saving...' : (isEditing ? 'Update Question' : 'Add Question')}
                    </button>
                    {isEditing && <button type="button" onClick={resetForm} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Cancel Edit</button>}
                </form>
            </div>


            {/* List of Existing Questions */}
            <h3>Existing Questions</h3>
            {loadingQuestions && <LoadingSpinner />}
            {errorQuestions && <div className="alert alert-danger">{errorQuestions}</div>}
            {!loadingQuestions && !errorQuestions && (
                <table className="problems-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Difficulty</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.length > 0 ? (
                            questions.map(q => (
                                <tr key={q._id}>
                                    <td>{q.questionNumber}</td>
                                    <td><Link to={`/problem/${q._id}`}>{q.name}</Link></td>
                                    <td>{q.difficulty}</td>
                                    <td>
                                        <button onClick={() => handleEditClick(q)} className="btn btn-light btn-sm">Edit</button>
                                        {/* Delete button if needed */}
                                        {/* <button onClick={() => handleDelete(q._id)} className="btn btn-danger btn-sm">Delete</button> */}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4">No questions found.</td></tr>
                        )}
                    </tbody>
                </table>
            )}

        </div>
    );
};

export default AdminDashboardPage;
