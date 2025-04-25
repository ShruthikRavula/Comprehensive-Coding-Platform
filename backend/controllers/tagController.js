import asyncHandler from 'express-async-handler';
import Question from '../models/Question.js';

// @desc    Get all unique tags from questions
// @route   GET /api/tags
// @access  Private (or Public, depending on if needed for filtering before login) - Let's make it Private
const getAllTags = asyncHandler(async (req, res) => {
    // Using distinct to get unique tags directly from the database
    const tags = await Question.distinct('tags');
    res.json(tags.sort()); // Return sorted tags
});

export { getAllTags };