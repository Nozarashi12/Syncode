import { useState, useEffect, useRef } from "react";
import socket from "../services/socket";

const Chat = ({ roomCode, username, darkMode }) => {
  const storageKey = `chat_${roomCode}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // Save to sessionStorage whenever messages change
  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages]);

  // Listen for new messages
  useEffect(() => {
    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("receive-message");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("send-message", { roomCode, username, message: input });
    setInput("");
  };

  return (
    <div className={`flex flex-col h-full ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}>
      <div className="p-2 border-b border-gray-600 font-semibold text-sm">💬 Chat</div>

      <div className="flex-grow overflow-y-auto p-2 flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div key={i} className={`text-sm ${msg.username === username ? "text-right" : "text-left"}`}>
            <span className="text-gray-400 text-xs">{msg.username} · {msg.time}</span>
            <div className={`inline-block px-3 py-1 rounded-lg mt-0.5 ${
              msg.username === username ? "bg-blue-600 text-white" : "bg-gray-600 text-white"
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 flex gap-2 border-t border-gray-600">
        <input
          className="flex-grow px-2 py-1 rounded bg-gray-700 text-white text-sm focus:outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 px-3 py-1 rounded text-white text-sm hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;