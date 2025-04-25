import asyncHandler from 'express-async-handler';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js'; // Needed for status calculation


// @desc    Get the next available question number
// @helper  Internal use
const getNextQuestionNumber = async () => {
    const lastQuestion = await Question.findOne().sort({ questionNumber: -1 });
    return lastQuestion ? lastQuestion.questionNumber + 1 : 1;
};


// @desc    Add a new question
// @route   POST /api/questions
// @access  Private/Admin
const addQuestion = asyncHandler(async (req, res) => {
    const { name, description, difficulty, tags, sampleTestCases, hiddenTestCases, templateCode } = req.body;

    if (!name || !description || !difficulty || !sampleTestCases || !hiddenTestCases) {
        res.status(400);
        throw new Error('Please provide all required fields: name, description, difficulty, sampleTestCases, hiddenTestCases');
    }

    const questionNumber = await getNextQuestionNumber();

    const question = new Question({
        questionNumber,
        name,
        description,
        difficulty,
        tags: tags || [],
        sampleTestCases,
        hiddenTestCases,
        templateCode: templateCode || {}, // Allow partial templates or default
    });

    const createdQuestion = await question.save();
    res.status(201).json(createdQuestion);
});

// @desc    Update an existing question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = asyncHandler(async (req, res) => {
    const { name, description, difficulty, tags, sampleTestCases, hiddenTestCases, templateCode } = req.body;

    const question = await Question.findById(req.params.id);

    if (question) {
        question.name = name || question.name;
        question.description = description || question.description;
        question.difficulty = difficulty || question.difficulty;
        question.tags = tags ?? question.tags; // Allow updating to empty array
        question.sampleTestCases = sampleTestCases || question.sampleTestCases;
        question.hiddenTestCases = hiddenTestCases || question.hiddenTestCases;
        question.templateCode = templateCode || question.templateCode;
        // questionNumber should generally not be updated

        const updatedQuestion = await question.save();
        res.json(updatedQuestion);
    } else {
        res.status(404);
        throw new Error('Question not found');
    }
});

// @desc    Get a single question by ID
// @route   GET /api/questions/:id
// @access  Public (Anyone can view a question)
const getQuestionById = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (question) {
        res.json(question);
    } else {
        res.status(404);
        throw new Error('Question not found');
    }
});

// @desc    Get all questions with filtering and user status
// @route   GET /api/questions
// @access  Private (Only signed-in users)
const getQuestions = asyncHandler(async (req, res) => {
    const { search, difficulty, tags, status } = req.query;
    const userId = req.user._id; // User must be logged in

    let query = {};

    // Basic Search (Case-insensitive)
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
        // If search term is a number, also check questionNumber
        if (!isNaN(parseInt(search))) {
            query.$or.push({ questionNumber: parseInt(search) });
        }
    }

    // Difficulty Filter
    if (difficulty) {
        query.difficulty = difficulty;
    }

    // Tags Filter (Match any selected tag)
    if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag); // Handle comma-separated tags
        if (tagArray.length > 0) {
            query.tags = { $in: tagArray };
        }
    }

    // Fetch questions based on filters
    const questions = await Question.find(query).sort({ questionNumber: 1 }); // Sort by question number

    // Fetch user's submission statuses for these questions
    const questionIds = questions.map(q => q._id);
    const userSubmissions = await Submission.find({
        user: userId,
        question: { $in: questionIds },
    }).select('question status -_id'); // Select only necessary fields

    // Map for quick lookup: questionId -> status ('Solved', 'Attempted')
    const submissionStatusMap = {};
    userSubmissions.forEach(sub => {
        const questionId = sub.question.toString();
        if (sub.status === 'Accepted') {
            submissionStatusMap[questionId] = 'Solved';
        } else if (!submissionStatusMap[questionId]) { // marked as 'Attempted' if not already 'Solved'
            submissionStatusMap[questionId] = 'Attempted';
        }
    });

    // status added to each question and filter based on requested status
    let questionsWithStatus = questions.map(q => {
        const qJson = q.toJSON(); // Convert Mongoose doc to plain object
        qJson.userStatus = submissionStatusMap[q._id.toString()] || 'Unattempted';
        return qJson;
    });

    // Status Filter (Applied after fetching and calculating status)
    if (status && status !== 'All') {
        questionsWithStatus = questionsWithStatus.filter(q => q.userStatus === status);
    }

    res.json(questionsWithStatus);
});


export { addQuestion, updateQuestion, getQuestionById, getQuestions };