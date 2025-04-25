import React from 'react';
import AceEditor from 'react-ace';

// Import Ace editor modes and themes
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github'; // Choose a theme
import 'ace-builds/src-noconflict/ext-language_tools'; // For autocompletion (optional)

const languageModeMap = {
    python: 'python',
    java: 'java',
    cpp: 'c_cpp',
    javascript: 'javascript',
};

const CodeEditor = ({ language, value, onChange, height = '400px' }) => {
    const mode = languageModeMap[language] || 'javascript'; // Default to javascript if language unknown

    return (
        <div className="editor-container" style={{ height: height }}>
            <AceEditor
                mode={mode}
                theme="github" // Or another theme like 'monokai', 'xcode'
                onChange={onChange}
                value={value}
                name="code-editor" // Unique ID for the editor instance
                editorProps={{ $blockScrolling: true }}
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: false,
                    showLineNumbers: true,
                    tabSize: 4,
                    useWorker: false
                }}
                style={{ width: '100%', height: '100%' }} // Fills container
            />
        </div>
    );
};

export default CodeEditor;
