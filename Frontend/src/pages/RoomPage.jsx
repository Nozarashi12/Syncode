import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const RoomPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [createdRoom, setCreatedRoom] = useState(null);
  const [error, setError] = useState("");
  const [darkMode] = useState(true);

  const handleCreate = async () => {
    if (!username.trim()) return setError("Enter your name first");
    try {
      const res = await API.post("room/create", { username });
      setCreatedRoom(res.data);
      // Auto navigate as creator
      navigate(`/room/${res.data.roomCode}`, { state: { username } });
    } catch {
      setError("Failed to create room");
    }
  };

const handleJoin = async () => {
  if (!username.trim()) return setError("Enter your name first");
  if (!roomCode.trim()) return setError("Enter a room code");
  const code = roomCode.trim().toUpperCase(); // ← use this consistently
  try {
    await API.get(`room/validate/${code}`);
    navigate(`/room/${code}`, { state: { username } }); // ← use code not roomCode
  } catch {
    setError("Room not found. Check the code and try again.");
  }
};

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center">&lt; &gt; Syncōde</h1>
        <p className="text-gray-400 text-center">Collaborative coding, real-time</p>

        <input
          className="px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none"
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
        >
          Create New Room
        </button>

        <div className="flex items-center gap-2">
          <hr className="flex-grow border-gray-600" />
          <span className="text-gray-400 text-sm">or join existing</span>
          <hr className="flex-grow border-gray-600" />
        </div>

        <input
          className="px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none uppercase tracking-widest"
          placeholder="Room code (e.g. A1B2C3D4)"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />

        <button
          onClick={handleJoin}
          className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
        >
          Join Room
        </button>

        {error && <p className="text-red-400 text-center text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default RoomPage;