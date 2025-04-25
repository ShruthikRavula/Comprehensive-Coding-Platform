import express from 'express';
import { getAllTags } from '../controllers/tagController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Requires login to get tags (as it's used in the authenticated questions list page)
router.route('/').get(protect, getAllTags);

export default router;
