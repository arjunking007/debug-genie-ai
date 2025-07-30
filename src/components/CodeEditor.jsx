import { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';

export const languages = ['python', 'javascript', 'cpp', 'java', 'html', 'css', 'c'];

const getLanguageExtension = (language) => {
  switch (language) {
    case 'python':
      return python();
    case 'javascript':
      return javascript();
    case 'cpp':
    case 'c':
      return cpp();
    case 'java':
      return java();
    case 'html':
      return html();
    case 'css':
      return css();
    default:
      return javascript();
  }
};

export const CodeEditor = ({ 
  value, 
  onChange, 
  language, 
  placeholder = "Enter your code here...",
  height = "400px"
}) => {
  const handleChange = useCallback((val) => {
    onChange(val);
  }, [onChange]);

  return (
    <div className="border border-editor-border rounded-lg overflow-hidden shadow-elegant">
      <CodeMirror
        value={value}
        height={height}
        theme={oneDark}
        extensions={[getLanguageExtension(language)]}
        onChange={handleChange}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: false,
          searchKeymap: true,
        }}
      />
    </div>
  );
};