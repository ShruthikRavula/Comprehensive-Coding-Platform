import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';
import Question from '../models/Question.js';
import { runCode, judgeCode } from '../services/codeRunner.js'; // MOCK runner

// @desc    Run code against custom input
// @route   POST /api/submissions/run
// @access  Private
const runCustomCode = asyncHandler(async (req, res) => {
    const { questionId, language, code, customInput } = req.body;
    const userId = req.user._id;

    if (!language || !code) {
        res.status(400);
        throw new Error('Language and code are required');
    }
    // customInput can be empty string

    // Use the mock code runner
    const result = await runCode(language, code, customInput || ''); // Empty string if null/undefined

    // Create a temporary submission record for this run (optional, but could be useful for history)
    // No tracking of "RUN", only "SUBMIT" is stored in DB.

    // return the result directly
    res.status(200).json({
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
    });

});


// @desc    Submit code against hidden test cases
// @route   POST /api/submissions/submit
// @access  Private
const submitCode = asyncHandler(async (req, res) => {
    const { questionId, language, code } = req.body;
    const userId = req.user._id;

    if (!questionId || !language || !code) {
        res.status(400);
        throw new Error('Question ID, language, and code are required');
    }

    const question = await Question.findById(questionId);
    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    // Create initial submission record
    let submission = new Submission({
        user: userId,
        question: questionId,
        language,
        code,
        status: 'Running', // Mark as running initially
    });
    await submission.save();

    try {
        // Use the mock code judger
        const judgeResult = await judgeCode(language, code, question.hiddenTestCases);

        // Updating of submission with results
        submission.status = judgeResult.overallStatus;
        submission.results = judgeResult.results;
        const updatedSubmission = await submission.save();

        res.status(200).json(updatedSubmission);

    } catch (error) {
        console.error("Error during code judging:", error);
        // Updating of submission status to indicate an error during judging itself
        submission.status = 'Runtime Error'; // Or a specific 'Judging Error' status
        submission.results = [{ testCaseIndex: -1, status: 'Runtime Error', error: 'Error during judging process' }];
        await submission.save();

        res.status(500).json({ message: 'Error judging code', submissionId: submission._id });
    }
});

// @desc    Get user's submissions for a specific question
// @route   GET /api/submissions/user/question/:questionId
// @access  Private
const getUserSubmissionsForQuestion = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { questionId } = req.params;

    const submissions = await Submission.find({
        user: userId,
        question: questionId,
    })
        .sort({ submittedAt: -1 }) // Show most recent first
        .select('-code'); // Optionally exclude full code from list view

    res.json(submissions);
});


// @desc    Get a specific submission by ID (to view details)
// @route   GET /api/submissions/:id
// @access  Private (ensure user owns submission)
const getSubmissionById = asyncHandler(async (req, res) => {
    const submission = await Submission.findById(req.params.id).populate('question', 'name questionNumber'); // Populate question name/number

    if (!submission) {
        res.status(404);
        throw new Error('Submission not found');
    }

    // Ensure the requesting user is the owner of the submission
    if (submission.user.toString() !== req.user._id.toString()) {
        res.status(403); // Forbidden
        throw new Error('Not authorized to view this submission');
    }

    res.json(submission);
});


export { runCustomCode, submitCode, getUserSubmissionsForQuestion, getSubmissionById };