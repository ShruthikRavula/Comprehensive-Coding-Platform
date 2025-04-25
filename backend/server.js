import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
// import { notFound, errorHandler } from './middleware/errorMiddleware.js'; // Need to create this

dotenv.config();
connectDB();

const app = express();

// CORS configuration - Adjust origin for frontend URL in production
app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'YOUR_PRODUCTION_FRONTEND_URL', // Allow frontend origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // Allow cookies if needed later
}));


app.use(express.json()); // Middleware to parse JSON bodies

// API Routes
app.get('/api', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/tags', tagRoutes);


// --- Error Handling Middleware ---
// Custom middleware for 404 Not Found errors
const notFounded = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass error to the next middleware (errorHandler)
};

// Custom error handler middleware
const errorHandlered = (err, req, res, next) => {
    // Sometimes errors might come with a status code, otherwise default to 500
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose bad ObjectId error handling
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        // Extract meaningful messages from validation errors
        const errors = Object.values(err.errors).map(el => el.message);
        message = `Invalid input data: ${errors.join('. ')}`;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    }


    res.status(statusCode).json({
        message: message,
        // Provide stack trace only in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

app.use(notFounded);
app.use(errorHandlered);
// --- End Error Handling ---


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
