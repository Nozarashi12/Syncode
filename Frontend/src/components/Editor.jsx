import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

const Editor = ({ code, setCode, language, darkMode }) => {
    const editorContainerRef = useRef(null);
    const editorRef = useRef(null);

    useEffect(() => {
        if (!editorContainerRef.current) return;

        // Destroy previous instance if it exists
        if (editorRef.current) {
            editorRef.current.dispose();
        }

        // Create the Monaco editor instance
        editorRef.current = monaco.editor.create(editorContainerRef.current, {
            value: code,
            language: language,
            theme: darkMode ? "vs-dark" : "vs",
            automaticLayout: true,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            tabCompletion: "on",
            wordBasedSuggestions: true,
        });

        // Listen for content changes
        editorRef.current.onDidChangeModelContent(() => {
            setCode(editorRef.current.getValue());
        });

        // Register IntelliSense for each language
        if (language === "javascript") {
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false,
            });
        } else {
            registerIntelliSense(language);
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
            }
        };
    }, [language, darkMode]);

    return <div className="w-full h-full" ref={editorContainerRef}></div>;
};

// Function to add custom IntelliSense for Python, Java, and C++
const registerIntelliSense = (language) => {
    monaco.languages.registerCompletionItemProvider(language, {
        provideCompletionItems: () => {
            const suggestions = [
                {
                    label: "print",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "print($0)",
                },
                {
                    label: "main",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText:
                        language === "cpp"
                            ? "#include <iostream>\nusing namespace std;\n\nint main() {\n    $0\n    return 0;\n}"
                            : language === "java"
                            ? "public class Main {\n    public static void main(String[] args) {\n        $0\n    }\n}"
                            : "def main():\n    $0",
                },
            ];
            return { suggestions };
        },
    });
};

export default Editor;
