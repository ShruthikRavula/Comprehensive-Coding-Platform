import mongoose from 'mongoose';

const resultSchema = mongoose.Schema({
    testCaseIndex: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Passed', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
        required: true
    },
    output: { type: String }, // Actual output from user code
    expectedOutput: { type: String }, // Expected output for comparison
    error: { type: String }, // Error message if any
}, { _id: false });


const submissionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        question: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Question',
        },
        language: {
            type: String,
            required: true,
            enum: ['python', 'java', 'cpp', 'javascript'],
        },
        code: {
            type: String,
            required: true,
        },
        // Status for the overall submission after running against hidden test cases
        status: {
            type: String,
            enum: ['Pending', 'Running', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error'],
            default: 'Pending',
        },
        // Results for hidden test cases (only populated after a 'submit' action)
        results: [resultSchema],
        // Output for custom run (only populated after a 'run' action)
        customRunOutput: {
            output: { type: String },
            error: { type: String },
            executionTime: { type: Number } // Optional: Time in ms
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying of user submissions per question
submissionSchema.index({ user: 1, question: 1, submittedAt: -1 });
submissionSchema.index({ user: 1, status: 1 }); // For getting solved status


const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
