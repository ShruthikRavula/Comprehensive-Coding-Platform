// MOCK CODE RUNNER - Replace with a real sandboxed execution environment
import fetch from 'node-fetch';

async function runCodeAndGenerateOutput(language, version, code, filename = "main") {
    try {
        console.log(`Running code in ${language}...`);
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language,
                version,
                files: [{ name: filename, content: code }]
            }),
        });
    
        const result = await response.json();
        console.log(`\n[${language.toUpperCase()} Output]:\n`, result.run.output);
    }
    catch (error) {
        console.error("Error running code:", error);
    }
}
const versions = {"python": "3.8.10", "javascript": "16.3.0", "java": "15.0.2", "cpp": "11"}
const runCode = async (language, code, input) => {
    console.log(`MOCK RUN: Lang=${language}, Input=${input}, code: \n ${code}`);
    const output = await runCodeAndGenerateOutput(language, versions[language], code, Solution)
    console.log(`MOCK RUN OUTPUT: ${output}`);

    // Basic Mock Logic (VERY simplified)
    if (code.includes("error")) {
        return { output: null, error: "Mock Runtime Error: Code contained 'error'", executionTime: 50 };
    }
    if (code.includes("compile error")) {
        return { output: null, error: "Mock Compilation Error", executionTime: 20 };
    }
    if (code.includes("timeout")) {
        // Simulation of timeout by returning an error or specific status later
        return { output: null, error: "Mock Time Limit Exceeded", executionTime: 2000 };
    }

    // Simulation successful execution
    let mockOutput = `Mock output for input: ${input}\nLanguage: ${language}`;
    if (language === 'python' && code.includes('print')) {
        mockOutput = code.split('print(')[1]?.split(')')[0]?.replace(/['"]/g, '') || `Default Python Output for ${input}`;
    } else if (language === 'javascript' && code.includes('console.log')) {
        mockOutput = code.split('console.log(')[1]?.split(')')[0]?.replace(/['"`]/g, '') || `Default JS Output for ${input}`;
    }

    return { output: mockOutput, error: null, executionTime: Math.floor(Math.random() * 500) + 50 };
};

const judgeCode = async (language, code, testCases) => {
    try {
        
        const results = [];
        let overallStatus = 'Accepted'; // Assume success initially
    
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            // Simulation of execution for each test case
            console.log(`Running test case ${i + 1}: ${JSON.stringify(testCase)}`);
            const result = await runCode(language, code, testCase.input);
            // await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50)); // Small delay per test case
    
            let status;
            if (result.error) {
                if (result.error.includes("Compilation")) {
                    status = 'Compilation Error';
                    overallStatus = 'Compilation Error';
                } else if (result.error.includes("Time Limit")) {
                    status = 'Time Limit Exceeded';
                    if (overallStatus === 'Accepted') overallStatus = 'Time Limit Exceeded';
                } else {
                    status = 'Runtime Error';
                    if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
                }
                results.push({ testCaseIndex: i, status, output: null, expectedOutput: testCase.output, error: result.error });
                // Stop processing further cases if compilation error
                if (status === 'Compilation Error') break;
            } else if (result.output?.trim() === testCase.output?.trim()) {
                status = 'Passed';
                results.push({ testCaseIndex: i, status, output: result.output, expectedOutput: testCase.output, error: null });
            } else {
                status = 'Wrong Answer';
                results.push({ testCaseIndex: i, status, output: result.output, expectedOutput: testCase.output, error: null });
                if (overallStatus === 'Accepted') overallStatus = 'Wrong Answer';
            }
        }
    
        // Case where no test cases were run (e.g., immediate compile error)
        if (results.length === 0 && code.includes("compile error")) {
            overallStatus = 'Compilation Error';
        } else if (results.length < testCases.length && overallStatus !== 'Compilation Error') {
            // good for robustness
            if (overallStatus === 'Accepted') overallStatus = 'Runtime Error'; // Assume runtime error stopped it
        }
    
    
        return { overallStatus, results };
    }
    catch (error) {
        console.error("Error judging code:", error);
        return { overallStatus: 'Error', results: [], error: "Internal Error" };
    }
};


export { runCode, judgeCode };