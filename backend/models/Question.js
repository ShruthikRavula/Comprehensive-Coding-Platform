import mongoose from 'mongoose';

const testCaseSchema = mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
}, { _id: false }); // No separate _id for test cases

const questionSchema = mongoose.Schema(
    {
        questionNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            required: true,
            enum: ['Easy', 'Medium', 'Hard'],
        },
        tags: {
            type: [String],
            default: [],
        },
        sampleTestCases: [testCaseSchema],
        hiddenTestCases: [testCaseSchema],
        templateCode: {
            python: { type: String, default: '# Write your Python code here' },
            java: { type: String, default: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your Java code here\n    }\n}' },
            cpp: { type: String, default: '#include <iostream>\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}' },
            javascript: { type: String, default: '// Write your Javascript code here' },
        },
        // submission status per question not stored here. It's derived from Submissions collection.
    },
    {
        timestamps: true,
    }
);

// questionNumber is indexed for efficient lookup
questionSchema.index({ questionNumber: 1 });
questionSchema.index({ name: 'text', description: 'text' }); // For text search
questionSchema.index({ difficulty: 1 });
questionSchema.index({ tags: 1 });


const Question = mongoose.model('Question', questionSchema);
export default Question;