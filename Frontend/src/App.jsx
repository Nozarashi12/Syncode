import { BrowserRouter, Routes, Route } from "react-router-dom";
import CompilerPage from "./pages/compilerpage";
import AuthPage from "./pages/Authpage";
import ForgotPass from "./pages/Forgotpass";
import RoomPage from "./pages/RoomPage";
import CollabCompilerPage from "./pages/CollabCompilerPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CompilerPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/room" element={<RoomPage />} />
        <Route path="/room/:roomCode" element={<CollabCompilerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;