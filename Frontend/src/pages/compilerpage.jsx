import { useState } from "react";
import Editor from "../components/Editor";
import API from "../services/api"; // Axios instance
import sun from "../assets/sun.png";
import moon from "../assets/moon.png";

const CompilerPage = () => {
  const [language, setLanguage] = useState("python");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Run your code to see output here");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("output");
  const [darkMode, setDarkMode] = useState(true); // Toggle dark mode

  const languages = [
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "cpp", label: "C++" },
    { value: "java", label: "Java" },
  ];

  const presetCode = {
    python: `print("Try Syncode")`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Try Syncode" << endl;\n    return 0;\n}`,
    javascript: `console.log("Try Syncode");`,
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Try Syncode");\n    }\n}`,
  };

  const [code, setCode] = useState(presetCode[language]);

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    setCode(presetCode[selectedLanguage]);
  };

  const handleRun = async () => {
    setLoading(true);
    setOutput("Running...");
    setActiveTab("output");

    try {
      const response = await API.post("compiler/execute", {
        language,
        code,
        input,
      });

      console.log(response, "response");
      if (response.data.error) {
        console.log(response.data.error, "error");
        setOutput(`Error: ${response.data.error}`);
      } else {
        console.log(response.data.output, "output");
        setOutput(response.data.output || "No output received");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Error executing code";
      console.log(errorMessage, "error");
      setOutput(`Error: ${errorMessage}`);
    }

    setLoading(false);
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      } flex flex-col h-screen transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <header
        className={`p-4 border-2 border-black ${
          darkMode ? "bg-gray-800" : "bg-gray-200"
        } flex justify-between items-center transition-all duration-300`}
      >
<h1 className="text-2xl font-semibold font-custom">&lt; &gt; Syncōde </h1>

        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-2 py-1 rounded-md transition-all duration-300 shadow-lg"
          >
            <img
              src={darkMode ? sun : moon}
              alt="Theme Icon"
              className="w-6 h-6"
            />
          </button>

          {/* Language Selector */}
          <select
            className={`px-3 py-1 border rounded-md transition-all duration-300 ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-gray-300 text-black border-gray-500"
            }`}
            value={language}
            onChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Run Button */}
          <button
            onClick={handleRun}
            className={`px-4 py-2 rounded-md transition-all duration-300 ${
              darkMode
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            disabled={loading}
          >
            {loading ? "Running..." : "Run Code"}
          </button>
        </div>
      </header>

      {/* Split Layout */}
      <div className="flex flex-grow">
        {/* Code Editor (50%) */}
        <div
          className={`w-1/2 p-4 border-r transition-all duration-300 border-2 border-black ${
            darkMode
              ? "bg-[#1e1e1e] text-white "
              : "bg-white text-black border-2 border-black"
          }`}
        >
          <Editor
            code={code}
            setCode={setCode}
            language={language}
            darkMode={darkMode}
          />
        </div>

        {/* Tabs for Input/Output (50%) */}
        <div className="w-1/2 p-4 flex flex-col border-2 border-black">
          {/* Tabs */}
          <div className="flex border-b border-gray-600">
            <button
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === "input"
                  ? "border-b-2 border-white text-gray-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("input")}
            >
              Input
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === "output"
                  ? "border-b-2 border-white text-gray-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("output")}
            >
              Output
            </button>
          </div>

          {/* Tab Content */}
          <div
            className={`p-4 rounded-md flex-grow transition-all duration-300 ${
              darkMode ? "bg-[#1e1e1e] text-white" : "bg-white text-black"
            }`}
          >
            {activeTab === "input" ? (
              <textarea
                className={`w-full p-2 border rounded-md transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-200 text-black border-gray-400"
                }`}
                rows="4"
                placeholder="Enter input here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              ></textarea>
            ) : (
              <pre className="whitespace-pre-wrap italic transition-all duration-300">
                {output}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompilerPage;
