import express from 'express';
import {
    runCustomCode,
    submitCode,
    getUserSubmissionsForQuestion,
    getSubmissionById
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All submission routes require authentication
router.post('/run', protect, runCustomCode);
router.post('/submit', protect, submitCode);
router.get('/user/question/:questionId', protect, getUserSubmissionsForQuestion);
router.get('/:id', protect, getSubmissionById); // Get details of a specific submission


export default router;