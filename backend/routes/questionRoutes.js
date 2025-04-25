import express from 'express';
import {
    addQuestion,
    updateQuestion,
    getQuestionById,
    getQuestions
} from '../controllers/questionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Authenticated users can get list of questions
router.route('/').get(protect, getQuestions);

// Admin routes for adding/updating questions
router.route('/').post(protect, admin, addQuestion);
router.route('/:id').put(protect, admin, updateQuestion);

// Public route to get single question details (anyone can view)
router.route('/:id').get(getQuestionById);


export default router;
