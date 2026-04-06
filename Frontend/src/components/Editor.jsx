import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

const Editor = ({ code, setCode, language, darkMode }) => {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);

  // Initialize editor when language or darkMode changes
  useEffect(() => {
    if (!editorContainerRef.current) return;

    if (editorRef.current) {
      editorRef.current.dispose();
    }

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

    editorRef.current.onDidChangeModelContent(() => {
      setCode(editorRef.current.getValue());
    });

    if (language !== "javascript") {
      registerIntelliSense(language);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, [language, darkMode]);

  // Sync remote code changes into the editor
  useEffect(() => {
    if (!editorRef.current) return;
    const currentValue = editorRef.current.getValue();
    if (currentValue !== code) {
      // Preserve cursor position
      const position = editorRef.current.getPosition();
      editorRef.current.setValue(code);
      if (position) editorRef.current.setPosition(position);
    }
  }, [code]);

  return <div className="w-full h-full" ref={editorContainerRef}></div>;
};

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