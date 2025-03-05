import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Authpage from "./pages/Authpage";
import ForgotPassword from "./pages/Forgotpass";
import CompilerPage from "./pages/compilerpage"; // Added compiler page

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Authpage />} />
                <Route path="/Forgotpass" element={<ForgotPassword />} />
                <Route path="/compiler" element={<CompilerPage />} /> 
            </Routes>
        </Router>
    );
}

export default App;
