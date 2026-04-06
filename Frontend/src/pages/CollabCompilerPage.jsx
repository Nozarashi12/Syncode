import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Editor from "../components/Editor";
import Chat from "../components/Chat";
import API from "../services/api";
import socket from "../services/socket";
import sun from "../assets/sun.png";
import moon from "../assets/moon.png";

const CollabCompilerPage = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(`print("Try Syncode")`);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Run your code to see output here");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("output");
  const [darkMode, setDarkMode] = useState(true);
  const [users, setUsers] = useState([]);
  const [copied, setCopied] = useState(false);
  const isRemoteUpdate = useRef(false);

  const presetCode = {
    python: `print("Try Syncode")`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Try Syncode" << endl;\n    return 0;\n}`,
    javascript: `console.log("Try Syncode");`,
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Try Syncode");\n    }\n}`,
  };

  const languages = [
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "cpp", label: "C++" },
    { value: "java", label: "Java" },
  ];

  useEffect(() => {
    if (!username) { navigate("/room"); return; }

    socket.connect();
    socket.emit("join-room", { roomCode, username });

    socket.on("room-state", ({ code, language, input, output, users }) => {
      isRemoteUpdate.current = true;
      setCode(code || presetCode[language]);
      setLanguage(language);
      setInput(input || "");
      setOutput(output || "Run your code to see output here");
      setUsers(users);
    });

    socket.on("code-update", (newCode) => {
      isRemoteUpdate.current = true;
      setCode(newCode);
    });

    socket.on("language-update", (lang) => {
      isRemoteUpdate.current = true;
      setLanguage(lang);
      setCode(presetCode[lang]);
    });

    socket.on("input-update", (val) => setInput(val));
    socket.on("output-update", (val) => setOutput(val));
    socket.on("user-joined", ({ users }) => setUsers(users));
    socket.on("user-left", ({ users }) => setUsers(users));

    return () => {
      socket.off("room-state");
      socket.off("code-update");
      socket.off("language-update");
      socket.off("input-update");
      socket.off("output-update");
      socket.off("user-joined");
      socket.off("user-left");
      socket.disconnect();
    };
  }, [roomCode, username]);

  const handleCodeChange = (newCode) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    setCode(newCode);
    socket.emit("code-change", { roomCode, code: newCode });
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(presetCode[lang]);
    socket.emit("language-change", { roomCode, language: lang });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit("input-change", { roomCode, input: e.target.value });
  };

  const handleRun = async () => {
    setLoading(true);
    setOutput("Running...");
    setActiveTab("output");
    try {
      const response = await API.post("compiler/execute", { language, code, input });
      const result = response.data.error
        ? `Error: ${response.data.error}`
        : response.data.output || "No output received";
      setOutput(result);
      socket.emit("output-change", { roomCode, output: result });
    } catch (error) {
      const result = `Error: ${error.response?.data?.error || "Error executing code"}`;
      setOutput(result);
      socket.emit("output-change", { roomCode, output: result });
    }
    setLoading(false);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied("code");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomCode}`);
    setCopied("link");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} flex flex-col h-screen`}>
      {/* Header */}
      <header className={`p-3 border-b-2 border-black ${darkMode ? "bg-gray-800" : "bg-gray-200"} flex justify-between items-center gap-4 flex-wrap`}>
        <h1 className="text-xl font-semibold font-custom">&lt; &gt; Syncōde</h1>

        {/* Room info */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Room:</span>
          <span className="font-mono font-bold tracking-widest">{roomCode}</span>
          <button
            onClick={copyRoomCode}
            className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 transition"
          >
            {copied === "code" ? "✅ Copied!" : "Copy Code"}
          </button>
          <button
            onClick={copyRoomLink}
            className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 transition"
          >
            {copied === "link" ? "✅ Copied!" : "Copy Link"}
          </button>
        </div>

        {/* Users */}
        <div className="flex items-center gap-2 flex-wrap">
          {users.map((u) => (
            <span
              key={u.id}
              className={`text-xs px-2 py-1 rounded-full ${
                u.username === username ? "bg-blue-600" : "bg-green-600"
              }`}
            >
              {u.username === username ? `${u.username} (you)` : u.username}
            </span>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="px-2 py-1 rounded-md">
            <img src={darkMode ? sun : moon} alt="Theme" className="w-6 h-6" />
          </button>
          <select
            className={`px-3 py-1 border rounded-md ${
              darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-300 text-black border-gray-500"
            }`}
            value={language}
            onChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition disabled:opacity-60"
          >
            {loading ? "Running..." : "Run Code"}
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-grow overflow-hidden">
        {/* Editor - 50% */}
        <div className={`w-1/2 border-r-2 border-black ${darkMode ? "bg-[#1e1e1e]" : "bg-white"}`}>
          <Editor
            code={code}
            setCode={handleCodeChange}
            language={language}
            darkMode={darkMode}
          />
        </div>

        {/* Right panel */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Input/Output - top 60% */}
          <div className="flex flex-col border-b-2 border-black" style={{ height: "60%" }}>
            <div className="flex border-b border-gray-600">
              <button
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "input" ? "border-b-2 border-blue-400 text-blue-400" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("input")}
              >
                Input
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "output" ? "border-b-2 border-blue-400 text-blue-400" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("output")}
              >
                Output
              </button>
            </div>
            <div
              className={`p-4 flex-grow overflow-auto ${
                darkMode ? "bg-[#1e1e1e] text-white" : "bg-white text-black"
              }`}
            >
              {activeTab === "input" ? (
                <textarea
                  className={`w-full h-full p-2 border rounded-md resize-none ${
                    darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-200 text-black border-gray-400"
                  }`}
                  placeholder="Enter input here..."
                  value={input}
                  onChange={handleInputChange}
                />
              ) : (
                <pre className="whitespace-pre-wrap italic">{output}</pre>
              )}
            </div>
          </div>

          {/* Chat - bottom 40% */}
          <div style={{ height: "40%" }} className="overflow-hidden">
            <Chat roomCode={roomCode} username={username} darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollabCompilerPage;