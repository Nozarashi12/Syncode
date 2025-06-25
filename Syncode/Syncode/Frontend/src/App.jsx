import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Authpage from "./pages/Authpage";
import ForgotPassword from "./pages/Forgotpass";
import CompilerPage from "./pages/compilerpage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CompilerPage />} />
                <Route path="/auth" element={<Authpage />} />
                <Route path="/forgotpass" element={<ForgotPassword />} />
            </Routes>
        </Router>
    );
}

export default App;
